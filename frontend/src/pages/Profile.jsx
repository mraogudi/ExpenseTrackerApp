import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Box, Tabs, TabList, TabPanels, Tab, TabPanel, Heading, VStack, FormControl,
  FormLabel, Input, Button, Avatar, Flex, Divider, useColorModeValue, Card,
  CardBody, InputGroup, InputLeftElement, InputRightElement, IconButton,
  SlideFade, Spinner, Center, useToast, Select, SimpleGrid, HStack, Text,
  Slider, SliderTrack, SliderFilledTrack, SliderThumb, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure
} from "@chakra-ui/react";

import { motion } from "framer-motion";
const MotionBox = motion(Box);

import {
  FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiLock, FiImage
} from "react-icons/fi";

import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import Cropper from "react-easy-crop";
import { useNavigate } from "react-router-dom";
import profileService from "../services/profileService";
import useAuth from "../hooks/useAuth";

// utility to create object url from byte[] (and return also mime)
function bytesToObjectUrl(bytes, mime = "image/jpeg") {
  const arr = new Uint8Array(bytes);
  const blob = new Blob([arr], { type: mime });
  const url = URL.createObjectURL(blob);
  return url;
}

// getCroppedImg helper (keeps same behavior as before)
const createImage = (url) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = (err) => reject(err);
  img.setAttribute("crossOrigin", "anonymous");
  img.src = url;
});

async function getCroppedImg(imageSrc, cropAreaPixels) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const { width, height, x, y } = cropAreaPixels;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  const c = document.createElement("canvas");
  const cctx = c.getContext("2d");
  const size = Math.min(width, height);
  c.width = size; c.height = size;

  const sx = (width - size) / 2;
  const sy = (height - size) / 2;

  cctx.save();
  cctx.beginPath();
  cctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  cctx.clip();
  cctx.drawImage(canvas, sx, sy, size, size, 0, 0, size, size);
  cctx.restore();

  return new Promise((resolve) => {
    c.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
  });
}

export default function Profile() {
  const { photo, setPhoto } = useAuth(); // photo from AuthContext (blob URL)
  const toast = useToast();
  const navigation = useNavigate();
  const cardBg = useColorModeValue("white", "gray.800");

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
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [country, setCountry] = useState("");

  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [pwdStrengthPercent, setPwdStrengthPercent] = useState(0);
  const [pwdStrengthColor, setPwdStrengthColor] = useState("red");
  const [pwdMatch, setPwdMatch] = useState("");

  const [previewPhoto, setPreviewPhoto] = useState(null); // blob URL
  const previewRef = useRef(null); // to track current objectURL for revocation

  const [isCropping, setIsCropping] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const maxDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  // when AuthContext's photo changes, reflect it
  useEffect(() => {
    // Revoke previous preview if it's a blob and different
    if (previewRef.current && previewRef.current !== photo) {
      if (previewRef.current.startsWith("blob:")) URL.revokeObjectURL(previewRef.current);
    }
    setPreviewPhoto(photo || null);
    previewRef.current = photo || null;
  }, [photo]);

  useEffect(() => {
    loadProfile();
    loadCountries();
    // revoke on unmount
    return () => {
      if (previewRef.current && previewRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
    };
  }, []);

  const loadCountries = async () => {
    try {
      const countriesData = localStorage.getItem("countries");
      setCountries(countriesData ? JSON.parse(countriesData) : []);
    } catch (err) {
      console.error("Error loading countries", err);
    }
  }

  const loadProfile = async () => {
    try {
      const resp = await profileService.getProfile();
      const data = resp.data || {};

      setUserData(data);
      setFullName(data.fullName || "");
      setUsername(data.userName || "");
      setDob(data.dateOfBirth || "");
      setGender(data.gender || "");
      setEmail(data.email || "");

      let phoneVal = (data.phone || "").toString().trim();
      phoneVal = phoneVal.replace(/\s+/g, "").replace(/^\+91/, "").replace(/\D/g, "");
      setPhone(phoneVal);
      setAddress(data.addressLine1 || "");
      setAddress2(data.addressLine2 || "");
      setCity(data.city || "");
      setPincode(data.pincode || "");
      if (data.country) {
        const resp2 = await profileService.states(data.countryId);
        setStates(resp2.data || []);
        setStateVal(data.stateId || "");
        setCountry(data.countryId || "");
      }

      // If backend returned photo bytes, convert to blob url and set preview
      if (data.photo) {
        const arr = new Uint8Array(data.photo);
        const blob = new Blob([arr], { type: data.photoType });
        const url = URL.createObjectURL(blob);
        // revoke previous preview if needed
        if (previewRef.current && previewRef.current.startsWith("blob:")) {
          URL.revokeObjectURL(previewRef.current);
        }
        setPreviewPhoto(url);
        previewRef.current = url;
        setPhoto(url);
      }

    } catch (err) {
      toast({ title: "Error loading profile", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(f.type)) {
      toast({ title: "Invalid file", status: "error" }); return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "Max 5MB", status: "error" }); return;
    }
    const url = URL.createObjectURL(f);
    setCropImage(url);
    setIsCropping(true);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const onCropComplete = useCallback((_a, p) => setCroppedAreaPixels(p), []);

  const uploadCroppedImage = async () => {
    if (!croppedAreaPixels || !cropImage) return;
    setLoadingPhoto(true);

    try {
      const blob = await getCroppedImg(cropImage, croppedAreaPixels);
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      // show temporary preview from local file
      const localUrl = URL.createObjectURL(file);
      if (previewRef.current && previewRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previewRef.current);
      }
      setPreviewPhoto(localUrl);
      previewRef.current = localUrl;
      setPhoto(localUrl);

      // perform upload
      await profileService.uploadPhoto(file, setUploadProgress);

      // fetch refreshed profile; convert server bytes -> object URL
      const refreshed = await profileService.getProfile();
      if (refreshed.data?.photo) {
        const bytes = Array.isArray(refreshed.data.photo)
          ? refreshed.data.photo
          : refreshed.data.photo.data;
        if (bytes?.length > 0) {
          const mime = refreshed.data.photoType || "image/jpeg";
          const newUrl = bytesToObjectUrl(bytes, mime);

          // revoke local preview if blob
          if (previewRef.current && previewRef.current.startsWith("blob:")) {
            URL.revokeObjectURL(previewRef.current);
          }
          setPreviewPhoto(newUrl);
          previewRef.current = newUrl;
          setPhoto(newUrl);
        }
      }

      toast({ title: "Photo updated", status: "success" });

    } catch (err) {
      console.error(err);
      toast({ title: "Upload failed", status: "error" });
    } finally {
      setLoadingPhoto(false);
      setIsCropping(false);
      setCropImage(null);
      setUploadProgress(0);
    }
  };

  const removePhoto = async () => {
    try {
      await profileService.deletePhoto();

      // Revoke existing URL
      if (previewRef.current && previewRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previewRef.current);
      }

      setPreviewPhoto(null);
      previewRef.current = null;
      setPhoto(null);

      toast({ title: "Photo removed successfully", status: "success" });
      onClose();
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to remove photo", status: "error" });
    }
  };

  const handlePhotoAction = () => {
    if (previewPhoto) {
      // Photo exists → open modal with options
      onOpen();
    } else {
      // No photo → directly open file selector
      document.getElementById("photoFile").click();
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
    const percent = Math.round(score / 5 * 100);
    const color = percent > 80 ? "blue" : percent > 60 ? "green" : percent > 40 ? "orange" : "red";
    return { percent, color };
  };

  useEffect(() => {
    const { percent, color } = evaluatePassword(newPwd);
    setPwdStrengthPercent(percent);
    setPwdStrengthColor(color);
    setPwdMatch(confirmPwd ? (confirmPwd === newPwd ? "Match" : "Not Match") : "");
  }, [newPwd, confirmPwd]);

  const savePersonal = async () => {
    try {
      setSubmit(true);
      await profileService.updatePersonal({
        fullName, userName: username, dateOfBirth: dob, gender, email, phone
      });
      toast({ title: "Personal updated", status: "success" });
      await loadProfile();
    } catch {
      toast({ title: "Error updating", status: "error" });
    } finally { setSubmit(false); }
  };

  const saveContact = async () => {
    try {
      setSubmit(true);
      const payload = {
        "addressLine1": address, "addressLine2": address2, "city": city, "pincode": pincode, "state": stateVal, "country": country
      };

      await profileService.updateContact(payload);
      toast({ title: "Contact updated", status: "success" });
      await loadProfile();
    } catch {
      toast({ title: "Error updating", status: "error" });
    } finally { setSubmit(false); }
  };

  const updatePassword = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      toast({ title: "Missing fields", status: "warning" }); return;
    }
    if (newPwd !== confirmPwd) {
      toast({ title: "Password mismatch", status: "error" }); return;
    }
    try {
      setSubmit(true);
      await profileService.updatePassword(oldPwd, newPwd);
      toast({ title: "Password updated", status: "success" });
      setOldPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch {
      toast({ title: "Error", status: "error" });
    } finally { setSubmit(false); }
  };

  const handleSave = () => tabIndex === 0 ? savePersonal() :
    tabIndex === 1 ? saveContact() :
      updatePassword();

  const handleClear = () => {
    setFullName(userData.fullName || "");
    setUsername(userData.userName || "");
    setDob(userData.dateOfBirth || "");
    setGender(userData.gender || "");
    setEmail(userData.email || "");
    setPhone((userData.phone || "").toString().replace(/^\+91/, "").replace(/\D/g, ""));

    setAddress(userData.address || "");
    setAddress2(userData.address2 || "");
    setCity(userData.city || "");
    setPincode(userData.pincode || "");
    setStateVal(userData.state || "");
    setCountry(userData.country || "");

    setOldPwd(""); setNewPwd(""); setConfirmPwd("");
  };

  if (loading) return (
    <Center minH="75vh"><Spinner size="xl" color="blue.500" /></Center>
  );

  const fetchStatesByCountry = async (countryId) => {
    try {
      setLoadingStates(true);
      const resp = await profileService.states(countryId);
      setStates(resp.data || []);
    } catch (e) {
      console.error("Error fetching states", e);
      toast({ title: "Unable to load states", status: "error" });
    } finally {
      setLoadingStates(false);
    }
  };

  return (
    <Flex justify="center" p={6}>
      <SlideFade in offsetY="20px">
        <Card maxW="4xl" w="100%" bg={cardBg} shadow="lg" borderRadius="2xl">
          <CardBody>

            {isCropping && (
              <Box position="fixed" inset={0} zIndex={2000} display="flex"
                justifyContent="center" alignItems="center"
                bg="blackAlpha.600" backdropFilter="blur(6px)">
                <MotionBox bg={useColorModeValue("white", "gray.800")}
                  borderRadius="xl" p={4} width="600px"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}>
                  <Heading size="sm" mb={3}>Adjust & Crop</Heading>

                  <Box height="360px" bg="gray.100" borderRadius="md"
                    overflow="hidden" position="relative">
                    <Cropper image={cropImage} crop={crop} zoom={zoom}
                      aspect={1} cropShape="round" showGrid={false}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom} />
                  </Box>

                  <Box mt={4}>
                    <Text mb={2}>Zoom</Text>
                    <Slider min={1} max={3} step={0.01} value={zoom}
                      onChange={setZoom}>
                      <SliderTrack><SliderFilledTrack bg="blue.300" /></SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </Box>

                  <Flex justify="flex-end" mt={4} gap={3}>
                    <Button variant="ghost"
                      onClick={() => { setIsCropping(false); setCropImage(null); }}>
                      Cancel
                    </Button>
                    <Button colorScheme="blue"
                      onClick={uploadCroppedImage}
                      isLoading={loadingPhoto}>
                      Apply Crop & Upload
                    </Button>
                  </Flex>
                </MotionBox>
              </Box>
            )}

            <Flex direction="column" align="center" mb={6} pt={4}>
              <MotionBox position="relative" initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}>
                <Avatar size="xl" src={previewPhoto || null}
                  name={fullName || "Profile"} bg="blue.600" color="white" />
                <IconButton icon={<FiImage />} size="sm" colorScheme="blue"
                  position="absolute" bottom={0} right={0}
                  borderRadius="full"
                  onClick={handlePhotoAction} />
                <Input id="photoFile" type="file" display="none" accept="image/*"
                  onChange={handlePhotoFileSelect} />
              </MotionBox>
              <Heading size="lg" mt={3}>{fullName || "My Profile"}</Heading>
            </Flex>

            {/* Modal for photo actions */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Photo Options</ModalHeader>
                <ModalBody>
                  <Text>Choose an action for your profile photo.</Text>
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme="red" mr={3} onClick={removePhoto} isLoading={loadingPhoto}>
                    Remove Photo
                  </Button>
                  <Button mr={3} onClick={() => { document.getElementById("photoFile").click(); onClose(); }}>
                    Change Photo
                  </Button>
                  <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Divider mb={6} />

            <Tabs variant="soft-rounded" colorScheme="blue" isFitted
              index={tabIndex} onChange={setTabIndex}>
              <TabList mb={4}>
                <Tab>Personal</Tab><Tab>Contact</Tab><Tab>Password</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack spacing={6}>
                    <SimpleGrid columns={3} spacing={6} w="100%">
                      <FormControl>
                        <FormLabel>Full Name</FormLabel>
                        <InputGroup>
                          <InputLeftElement><FiUser /></InputLeftElement>
                          <Input value={fullName}
                            onChange={(e) => setFullName(e.target.value)} />
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Username</FormLabel>
                        <InputGroup>
                          <InputLeftElement><FiUser /></InputLeftElement>
                          <Input value={username}
                            onChange={(e) => setUsername(e.target.value)} />
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Date of Birth</FormLabel>
                        <InputGroup>
                          <InputLeftElement><FiCalendar /></InputLeftElement>
                          <Input type="date" value={dob} max={maxDate}
                            onChange={(e) => setDob(e.target.value)} />
                        </InputGroup>
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={3} spacing={6} w="100%">
                      <FormControl>
                        <FormLabel>Gender</FormLabel>
                        <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                          <option value="">Select</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <InputGroup>
                          <InputLeftElement><FiMail /></InputLeftElement>
                          <Input value={email}
                            onChange={(e) => setEmail(e.target.value)} />
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Phone</FormLabel>
                        <InputGroup>
                          <InputLeftElement><FiPhone /></InputLeftElement>
                          <Input
                            value={phone ? `+91${phone}` : "+91"}
                            onChange={(e) => {
                              let v = e.target.value.replace(/\s+/g, "");
                              v = v.replace(/^\+91/, "").replace(/\D/g, "");
                              if (v.length > 10) v = v.slice(0, 10);
                              setPhone(v);
                            }}
                          />
                        </InputGroup>
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={6}>
                    <SimpleGrid columns={3} spacing={6} w="100%">
                      <FormControl>
                        <FormLabel>Address Line 1</FormLabel>
                        <InputGroup>
                          <InputLeftElement><FiMapPin /></InputLeftElement>
                          <Input value={address}
                            onChange={(e) => setAddress(e.target.value)} />
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Address Line 2</FormLabel>
                        <Input value={address2}
                          onChange={(e) => setAddress2(e.target.value)} />
                      </FormControl>

                      <FormControl>
                        <FormLabel>City</FormLabel>
                        <Input value={city}
                          onChange={(e) => setCity(e.target.value)} />
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={3} spacing={6} w="100%">
                      <FormControl>
                        <FormLabel>Pincode</FormLabel>
                        <Input value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                          maxLength={6} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Country</FormLabel>
                        <Select
                          value={country}
                          onChange={(e) => {
                            const cid = e.target.value;
                            setCountry(cid);
                            fetchStatesByCountry(cid); // 🔥 Fetch states here
                          }}
                        >
                          <option value="">Select Country</option>
                          {countries.map(c => (
                            <option value={c.id}>{c.name}</option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>State</FormLabel>
                        <Select
                          value={stateVal}
                          onChange={(e) => setStateVal(e.target.value)}
                          isDisabled={loadingStates}
                        >
                          <option value="">Select State</option>

                          {loadingStates && <option>Loading...</option>}

                          {!loadingStates && states.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={6}>
                    <SimpleGrid columns={3} spacing={6} w="100%">
                      <FormControl>
                        <FormLabel>Current Password</FormLabel>
                        <InputGroup>
                          <InputLeftElement><FiLock /></InputLeftElement>
                          <Input type={showOld ? "text" : "password"}
                            value={oldPwd}
                            onChange={(e) => setOldPwd(e.target.value)} />
                          <InputRightElement>
                            <IconButton variant="ghost" size="sm"
                              icon={showOld ? <ViewOffIcon /> : <ViewIcon />}
                              onClick={() => setShowOld(!showOld)} />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>New Password</FormLabel>
                        <InputGroup>
                          <InputLeftElement><FiLock /></InputLeftElement>
                          <Input type={showNew ? "text" : "password"}
                            value={newPwd}
                            onChange={(e) => setNewPwd(e.target.value)} />
                          <InputRightElement>
                            <IconButton variant="ghost" size="sm"
                              icon={showNew ? <ViewOffIcon /> : <ViewIcon />}
                              onClick={() => setShowNew(!showNew)} />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Confirm Password</FormLabel>
                        <InputGroup>
                          <InputLeftElement><FiLock /></InputLeftElement>
                          <Input type={showConfirm ? "text" : "password"}
                            value={confirmPwd}
                            onChange={(e) => setConfirmPwd(e.target.value)} />
                          <InputRightElement>
                            <IconButton variant="ghost" size="sm"
                              icon={showConfirm ? <ViewOffIcon /> : <ViewIcon />}
                              onClick={() => setShowConfirm(!showConfirm)} />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={2} spacing={6} w="100%">
                      {/* Password Strength */}
                      <Box>
                        <Text mb={2}>Password Strength</Text>
                        <Box bg="gray.200" w="100%" h="8px" borderRadius="md" overflow="hidden">
                          <Box
                            h="100%"
                            width={`${pwdStrengthPercent}%`}
                            bg={pwdStrengthColor}
                            transition="width 0.2s"
                          />
                        </Box>
                      </Box>

                      {/* Match / Not Match */}
                      <Box display="flex" alignItems="right" justifyContent="right">
                        <Text fontSize="md" fontWeight="bold" color={pwdMatch === "Match" ? "green.500" : "red.500"}>
                          {pwdMatch || ""}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

              </TabPanels>
            </Tabs>

            <HStack spacing={4} mt={6}>
              <Button w="25%" colorScheme="gray"
                onClick={() => navigation("/dashboard")}>
                Dashboard
              </Button>
              <Button w="50%" colorScheme="blue"
                onClick={handleSave} isDisabled={submit}>
                {submit
                  ? tabIndex === 0 ? "Updating Personal..."
                    : tabIndex === 1 ? "Updating Contact..."
                      : "Updating Password..."
                  : tabIndex === 0 ? "Update Personal"
                    : tabIndex === 1 ? "Update Contact"
                      : "Update Password"}
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
