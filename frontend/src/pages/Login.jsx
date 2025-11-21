import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  HStack,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from "framer-motion"
import useAuth from '../hooks/useAuth'
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons"
import { toast } from "../utils/toast"
import profileService from '../services/profileService'

const MotionBox = motion(Box)

export default function Login() {
  const { login, token, loading, verifyMail } = useAuth()
  const [step, setStep] = useState("email")
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [recoveredInfo, setRecoveredInfo] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (recoveredInfo) {
      const timer = setTimeout(() => setRecoveredInfo(""), 10000);
      return () => clearTimeout(timer);
    }
  }, [recoveredInfo]);

  // Popup 1
  const {
    isOpen: isForgotUserOpen,
    onOpen: openForgotUser,
    onClose: closeForgotUser
  } = useDisclosure()

  // Popup 2
  const {
    isOpen: isForgotPassOpen,
    onOpen: _openForgotPass,
    onClose: closeForgotPass
  } = useDisclosure()

  const openForgotPass = () => {
    setForgotPassForm({ usernameOrEmail: form.email });
    _openForgotPass();
  };

  // Forgot Username / Email form
  const [forgotForm, setForgotForm] = useState({
    dob: "",
    phone: ""   // stored WITHOUT +91
  })

  // Forgot Password form
  const [forgotPassForm, setForgotPassForm] = useState({
    usernameOrEmail: ""
  })

  const clearForgot = () => setForgotForm({ dob: "", phone: "" })
  const clearForgotPass = () =>
    setForgotPassForm({ usernameOrEmail: form.email || "" })

  // Submit Forgot Username / Email
  const submitForgot = async () => {
    if (!forgotForm.dob || !forgotForm.phone) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const response = await profileService.recoverUserNameOrEmail(
        forgotForm.dob,
        "+91" + forgotForm.phone
      );

      const message = response.message;
      setRecoveredInfo(message);
      toast.success("Account found!");

      closeForgotUser();
      clearForgot();

    } catch (err) {
      console.error(err);
      toast.error("No account found with provided details");
    }
  };

  // Submit Forgot Password
  const submitForgotPass = async () => {
    if (!forgotPassForm.usernameOrEmail.trim()) {
      toast.error("Username/Email is required");
      return;
    }

    try {
      await profileService.sendResetLink(forgotPassForm.usernameOrEmail);
      toast.success("Reset link sent! Check your inbox.");
      setRecoveredInfo(`Reset link sent to ${forgotPassForm.usernameOrEmail}.`);
      closeForgotPass();
    } catch (e) {
      toast.error("Unable to send reset link");
    }
  };

  // Auto redirect
  useEffect(() => {
    if (!loading && token) navigate('/dashboard', { replace: true })
  }, [token, loading, navigate])

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const clearEmail = () => setForm({ ...form, email: '' })
  const clearPassword = () => setForm({ ...form, password: '' })

  const verifyEmail = async () => {
    if (!form.email.trim()) {
      toast.info("Please enter an email");
      return;
    }

    setBusy(true)

    try {
      const exists = await verifyMail(form.email.trim())
      if (exists) {
        toast.success("Email found!")
        setStep("password")
      } else {
        toast.error("Email not found")
        navigate('/register', { state: { email: form.email.trim() } })
      }
    } catch {
      toast.error("Unable to verify email")
    } finally {
      setBusy(false)
    }
  }

  const handleLogin = async () => {
    setBusy(true)
    try {
      await login(form.email.trim(), form.password)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid credentials'
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="100vh">
        <Skeleton height="320px" width="400px" borderRadius="md" />
      </Box>
    )
  }

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="center" h="100vh">
        <Card w="full" maxW="md">
          <CardBody>

            <AnimatePresence>
              {recoveredInfo && (
                <MotionBox
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  mb={3}
                >
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    {recoveredInfo}
                  </Alert>
                </MotionBox>
              )}
            </AnimatePresence>

            <Stack spacing={4}>
              <Heading size="md">Login</Heading>

              <FormControl isRequired>
                <FormLabel>Username/Email/Phone</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  isReadOnly={step === "password"}
                  pointerEvents={step === "password" ? "none" : "auto"}
                  opacity={step === "password" ? 0.8 : 1}
                />
              </FormControl>

              <AnimatePresence>
                {step === "password" && (
                  <MotionBox
                    key="password"
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -25 }}
                  >
                    <FormControl isRequired>
                      <FormLabel>Password</FormLabel>
                      <HStack>
                        <Input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={handleChange}
                          autoFocus
                        />
                        <Button onClick={() => setShowPassword(v => !v)} variant="ghost">
                          {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        </Button>
                      </HStack>
                    </FormControl>
                  </MotionBox>
                )}
              </AnimatePresence>

              <HStack spacing={3}>
                {step === "email" ? (
                  <>
                    <Button w="75%" colorScheme="blue" isLoading={busy} onClick={verifyEmail}>
                      Continue
                    </Button>
                    <Button w="25%" variant="outline" onClick={clearEmail}>Clear</Button>
                  </>
                ) : (
                  <>
                    <Button w="50%" colorScheme="blue" isLoading={busy} onClick={handleLogin}>
                      Sign In
                    </Button>

                    <Button
                      w="25%"
                      variant="outline"
                      onClick={() => {
                        setStep("email")
                        setForm({ ...form, password: "" })
                      }}
                    >
                      Back
                    </Button>

                    <Button w="25%" variant="outline" onClick={clearPassword}>
                      Clear
                    </Button>
                  </>
                )}
              </HStack>

              <HStack justify="space-between">
                <Link as={RouterLink} to="/register" color="blue.500">
                  Create an account
                </Link>

                <Link
                  color="blue.500"
                  onClick={() => {
                    if (step === "email") openForgotUser()
                    else openForgotPass()
                  }}
                >
                  {step === "email"
                    ? "Forgot username / email / phone?"
                    : "Forgot password?"}
                </Link>
              </HStack>
            </Stack>
          </CardBody>
        </Card>
      </Box>

      {/* POPUP 1 – FORGOT USERNAME/EMAIL */}
      <Modal isOpen={isForgotUserOpen} onClose={closeForgotUser} isCentered size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Recover Username / Email / Phone</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={4}>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Date of Birth</FormLabel>
                  <Input
                    type="date"
                    value={forgotForm.dob}
                    onChange={(e) => setForgotForm({ ...forgotForm, dob: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Phone Number</FormLabel>

                  {/* +91 DEFAULT ALWAYS */}
                  <Input
                    type="tel"
                    value={
                      forgotForm.phone
                        ? `+91${forgotForm.phone}`
                        : "+91"
                    }
                    onChange={(e) => {
                      let val = e.target.value.replace("+91", "").trim();
                      val = val.replace(/\D/g, ""); // digits only
                      setForgotForm({ ...forgotForm, phone: val });
                    }}
                  />
                </FormControl>
              </HStack>

              <HStack spacing={3}>
                <Button w="75%" colorScheme="blue" onClick={submitForgot}>
                  Get Username / Email / Phone
                </Button>
                <Button w="25%" variant="outline" onClick={clearForgot}>Clear</Button>
              </HStack>

            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* POPUP 2 – FORGOT PASSWORD */}
      <Modal isOpen={isForgotPassOpen} onClose={closeForgotPass} isCentered size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reset Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={4}>

              <FormControl isRequired>
                <FormLabel>Username / Email / Phone</FormLabel>
                <Input
                  placeholder="Enter username or email"
                  value={forgotPassForm.usernameOrEmail}
                  onChange={(e) =>
                    setForgotPassForm({ usernameOrEmail: e.target.value })
                  }
                />
              </FormControl>

              <HStack spacing={3}>
                <Button w="50%" colorScheme="blue" onClick={submitForgotPass}>
                  Get Password
                </Button>
                <Button w="25%" variant="outline" onClick={clearForgotPass}>
                  Clear
                </Button>
                <Button w="25%" variant="outline" onClick={closeForgotPass}>
                  Cancel
                </Button>
              </HStack>

            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
