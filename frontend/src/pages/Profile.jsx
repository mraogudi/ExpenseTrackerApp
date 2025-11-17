import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Avatar,
  Flex,
  Divider,
  useColorModeValue,
  Card,
  CardBody,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  SlideFade,
  Spinner,
  Center,
  useToast,
  Select,
  SimpleGrid,
  HStack,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  MotionBox,
} from "@chakra-ui/react";

import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiLock,
  FiImage,
} from "react-icons/fi";

import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

import Cropper from "react-easy-crop";
import { useNavigate } from "react-router-dom";
import profileService from "../services/profileService";
import useAuth from "../hooks/useAuth";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(imageSrc, cropAreaPixels) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const { width, height, x, y } = cropAreaPixels;
  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  const circCanvas = document.createElement("canvas");
  const cctx = circCanvas.getContext("2d");
  const size = Math.min(width, height);
  circCanvas.width = size;
  circCanvas.height = size;

  const sx = (width - size) / 2;
  const sy = (height - size) / 2;

  cctx.save();
  cctx.beginPath();
  cctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  cctx.clip();
  cctx.drawImage(canvas, sx, sy, size, size, 0, 0, size, size);
  cctx.restore();

  return new Promise((resolve) => {
    circCanvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
  });
}

export default function Profile() {
  const { user, photo } = useAuth();
  const cardBg = useColorModeValue("white", "gray.800");
  const toast = useToast();
  const navigation = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submit, setSubmit] = useState(false);
  const [userData, setUserData] = useState({});

  const [tabIndex, setTabIndex] = useState(0);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [pwdStrengthPercent, setPwdStrengthPercent] = useState(0);
  const [pwdStrengthColor, setPwdStrengthColor] = useState("red");
  const [pwdMatch, setPwdMatch] = useState("");

  const [shakeConfirm, setShakeConfirm] = useState(false);

  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const maxDate = useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setUserData(data.data || {});
      setFullName(data.data.fullName || "");
      setUsername(data.data.userName || "");
      setDob(data.data.dateOfBirth || "");
      setGender(data.data.gender || "");
      setEmail(data.data.email || "");
      setPhone(data.data.phone || "");
      setAddress(data.data.address || "");
      setCity(data.data.city || "");
    } catch (err) {
      toast({
        title: "Error loading profile",
        description: err?.message || "Failed to load profile.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Invalid file", status: "error" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", status: "error" });
      return;
    }

    const url = URL.createObjectURL(file);
    setCropImage(url);
    setIsCropping(true);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const onCropComplete = useCallback((_c, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const uploadCroppedImage = async () => {
    if (!croppedAreaPixels || !cropImage) {
      toast({ title: "Nothing to crop", status: "warning" });
      return;
    }

    setLoadingPhoto(true);
    setUploadProgress(0);

    try {
      const blob = await getCroppedImg(cropImage, croppedAreaPixels);
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      const previewUrl = URL.createObjectURL(file);
      setPreviewPhoto(previewUrl);

      await profileService.uploadPhoto(file);

      toast({
        title: "Photo updated",
        status: "success",
      });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err?.message,
        status: "error",
      });
    } finally {
      setLoadingPhoto(false);
      setIsCropping(false);
      setCropImage(null);
      setUploadProgress(0);
    }
  };

  const evaluatePassword = (pwd) => {
    let score = 0;
    if (!pwd) return { percent: 0, color: "red" };
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[@$!%*?&#]/.test(pwd)) score++;

    const percent = Math.round((score / 5) * 100);
    let color = "red";
    if (percent <= 40) color = "red";
    else if (percent <= 60) color = "orange";
    else if (percent <= 80) color = "green";
    else color = "blue";

    return { percent, color };
  };

  useEffect(() => {
    const { percent, color } = evaluatePassword(newPwd);
    setPwdStrengthPercent(percent);
    setPwdStrengthColor(color);

    if (!confirmPwd) setPwdMatch("");
    else if (newPwd === confirmPwd) setPwdMatch("Match");
    else {
      setPwdMatch("Not Match");
      setShakeConfirm(true);
      setTimeout(() => setShakeConfirm(false), 600);
    }
  }, [newPwd, confirmPwd]);

  const getButtonText = () =>
    tabIndex === 0
      ? "Update Personal"
      : tabIndex === 1
      ? "Update Contact"
      : "Update Password";

  const updateText = () =>
    tabIndex === 0
      ? "Updating Personal..."
      : tabIndex === 1
      ? "Updating Contact..."
      : "Updating Password...";

  const savePersonal = async () => {
    if (dob && dob > maxDate) {
      toast({ title: "Invalid DOB", status: "error" });
      return;
    }
    try {
      setSubmit(true);
      await profileService.updatePersonal({
        fullName,
        userName: username,
        dateOfBirth: dob,
        gender,
      });
      toast({ title: "Updated", status: "success" });
    } catch (err) {
      toast({ title: "Error", description: err?.message, status: "error" });
    } finally {
      setSubmit(false);
    }
  };

  const saveContact = async () => {
    try {
      setSubmit(true);
      await profileService.updateContact({
        email,
        phone,
        address,
        city,
      });
      toast({ title: "Updated", status: "success" });
    } catch (err) {
      toast({ title: "Error", description: err?.message, status: "error" });
    } finally {
      setSubmit(false);
    }
  };

  const updatePassword = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      toast({ title: "Missing fields", status: "warning" });
      return;
    }
    if (newPwd !== confirmPwd) {
      toast({ title: "Passwords mismatch", status: "error" });
      return;
    }

    try {
      setSubmit(true);
      await profileService.updatePassword(oldPwd, newPwd);
      toast({ title: "Updated", status: "success" });
      setOldPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      toast({ title: "Error", description: err?.message, status: "error" });
    } finally {
      setSubmit(false);
    }
  };

  const handleSave = () => {
    if (tabIndex === 0) return savePersonal();
    if (tabIndex === 1) return saveContact();
    if (tabIndex === 2) return updatePassword();
  };

  const handleClear = () => {
    if (tabIndex === 0) {
      setFullName(userData.fullName || "");
      setUsername(userData.userName || "");
      setDob(userData.dateOfBirth || "");
      setGender(userData.gender || "");
    } else if (tabIndex === 1) {
      setEmail(userData.email || "");
      setPhone(userData.phone || "");
      setAddress(userData.address || "");
      setCity(userData.city || "");
    } else {
      setOldPwd("");
      setNewPwd("");
      setConfirmPwd("");
    }
  };

  if (loading) {
    return (
      <Center minH="70vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  const sliderTrackProps = {
    bg: "rgba(66,153,225,0.15)",
    borderRadius: "999px",
  };
  const thumbProps = {
    boxSize: 5,
    bg: "white",
    border: "2px solid rgba(66,153,225,0.9)",
  };

  return (
    <Flex justify="center" p={6}>
      <SlideFade in offsetY="20px">
        <Card maxW="4xl" w="100%" bg={cardBg} shadow="lg" borderRadius="2xl">
          <CardBody>
            {isCropping && (
              <Box
                position="fixed"
                inset={0}
                zIndex={2000}
                display="flex"
                justifyContent="center"
                alignItems="center"
                style={{ backdropFilter: "blur(6px)" }}
              >
                <Box
                  position="absolute"
                  inset={0}
                  bg="blackAlpha.600"
                  onClick={() => {
                    setIsCropping(false);
                    setCropImage(null);
                  }}
                />
                <Box
                  bg={useColorModeValue("white", "gray.800")}
                  borderRadius="xl"
                  p={4}
                  width="600px"
                  zIndex={2100}
                >
                  <Heading size="sm" mb={3}>
                    Adjust & Crop
                  </Heading>

                  <Box
                    height="360px"
                    bg="gray.100"
                    borderRadius="md"
                    overflow="hidden"
                    position="relative"
                  >
                    <Cropper
                      image={cropImage}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </Box>

                  <Box mt={4}>
                    <Text mb={2}>Zoom</Text>
                    <Slider
                      min={1}
                      max={3}
                      step={0.01}
                      value={zoom}
                      onChange={setZoom}
                    >
                      <SliderTrack {...sliderTrackProps}>
                        <SliderFilledTrack bg="blue.300" />
                      </SliderTrack>
                      <SliderThumb {...thumbProps} />
                    </Slider>
                  </Box>

                  <Flex justify="flex-end" mt={4} gap={3}>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsCropping(false);
                        setCropImage(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={uploadCroppedImage}>
                      Apply Crop & Upload
                    </Button>
                  </Flex>
                </Box>
              </Box>
            )}

            <Flex direction="column" align="center" mb={6} pt={4}>
              <Box position="relative">
                <Box
                  borderRadius="full"
                  display="inline-block"
                  p={1}
                  bg={previewPhoto || photo ? "blue.200" : "transparent"}
                  boxShadow={
                    previewPhoto || photo
                      ? "0 8px 30px rgba(66,153,225,0.18)"
                      : "none"
                  }
                >
                  <Avatar
                    size="xl"
                    src={previewPhoto || photo || null}
                    name={fullName || "Profile"}
                    bg="blue.600"
                    color="white"
                  />
                </Box>

                {(loadingPhoto || uploadProgress > 0) && (
                  <Center
                    position="absolute"
                    top={0}
                    left={0}
                    w="100%"
                    h="100%"
                    borderRadius="full"
                    bg="blackAlpha.500"
                    color="white"
                    flexDir="column"
                  >
                    <Spinner />
                    <Text>{uploadProgress}%</Text>
                  </Center>
                )}

                <IconButton
                  icon={<FiImage />}
                  size="sm"
                  colorScheme="blue"
                  position="absolute"
                  bottom={0}
                  right={0}
                  borderRadius="full"
                  onClick={() =>
                    document.getElementById("photoFile").click()
                  }
                />

                <Input
                  id="photoFile"
                  type="file"
                  display="none"
                  accept="image/*"
                  onChange={handlePhotoFileSelect}
                />
              </Box>

              <Heading size="lg" mt={3}>
                {fullName || "My Profile"}
              </Heading>
            </Flex>

            <Divider mb={6} />

            <Tabs
              variant="soft-rounded"
              colorScheme="blue"
              isFitted
              index={tabIndex}
              onChange={setTabIndex}
            >
              <TabList mb={4}>
                <Tab>Personal</Tab>
                <Tab>Contact</Tab>
                <Tab>Password</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack spacing={6}>
                    <SimpleGrid columns={2} spacing={6} w="100%">
                      <FormControl>
                        <FormLabel>Full Name</FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <FiUser />
                          </InputLeftElement>
                          <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Username</FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <FiUser />
                          </InputLeftElement>
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </InputGroup>
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={2} spacing={6} w="100%">
                      <FormControl>
                        <FormLabel>Date of Birth</FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <FiCalendar />
                          </InputLeftElement>
                          <Input
                            type="date"
                            value={dob}
                            max={maxDate}
                            onChange={(e) => setDob(e.target.value)}
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={6}>
                    <SimpleGrid columns={2} spacing={6} w="100%">
                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <FiMail />
                          </InputLeftElement>
                          <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Phone</FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <FiPhone />
                          </InputLeftElement>
                          <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </InputGroup>
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={2} spacing={6} w="100%">
                      <FormControl>
                        <FormLabel>Address</FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <FiMapPin />
                          </InputLeftElement>
                          <Input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>City</FormLabel>
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={6} w="100%">
                    <FormControl>
                      <FormLabel>Current Password</FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <FiLock />
                        </InputLeftElement>
                        <Input
                          type={showOld ? "text" : "password"}
                          value={oldPwd}
                          onChange={(e) => setOldPwd(e.target.value)}
                        />
                        <InputRightElement>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            icon={showOld ? <ViewOffIcon /> : <ViewIcon />}
                            onClick={() => setShowOld(!showOld)}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <SimpleGrid columns={2} spacing={6} w="100%">
                      <FormControl>
                        <FormLabel>New Password</FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <FiLock />
                          </InputLeftElement>
                          <Input
                            type={showNew ? "text" : "password"}
                            value={newPwd}
                            onChange={(e) => setNewPwd(e.target.value)}
                          />
                          <InputRightElement>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              icon={showNew ? <ViewOffIcon /> : <ViewIcon />}
                              onClick={() => setShowNew(!showNew)}
                            />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Confirm Password</FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <FiLock />
                          </InputLeftElement>
                          <Input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPwd}
                            onChange={(e) => setConfirmPwd(e.target.value)}
                          />
                          <InputRightElement>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              icon={showConfirm ? <ViewOffIcon /> : <ViewIcon />}
                              onClick={() => setShowConfirm(!showConfirm)}
                            />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <HStack spacing={4} mt={6}>
              <Button
                w="25%"
                colorScheme="gray"
                onClick={() => navigation("/dashboard")}
              >
                Dashboard
              </Button>
              <Button
                w="50%"
                colorScheme="blue"
                onClick={handleSave}
                isDisabled={submit}
              >
                {submit ? updateText() : getButtonText()}
              </Button>
              <Button w="25%" variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </HStack>
          </CardBody>
        </Card>
      </SlideFade>
    </Flex>
  );
}
