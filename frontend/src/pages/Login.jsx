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
  Skeleton
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from "framer-motion"
import useAuth from '../hooks/useAuth'
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons"
import { toast } from "../utils/toast"

const MotionBox = motion(Box)

export default function Login() {
  const { login, token, loading, verifyMail } = useAuth() // make sure AuthContext exposes loading initially
  const [step, setStep] = useState("email")
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (!loading && token) navigate('/dashboard', { replace: true })
  }, [token, loading, navigate])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const clearEmail = () => setForm({ ...form, email: '' })
  const clearPassword = () => setForm({ ...form, password: '' })

  const verifyEmail = async () => {
    if (!form.email.trim()) {
      toast.info("Please enter an email");
      return;
    }
    setBusy(true);
    try {
      const exists = await verifyMail(form.email.trim());
      if (exists) {
        toast.success("Email found!");
        setStep("password");
      } else {
        toast.error("Email not found");
        navigate('/register', { state: { email: form.email.trim() } });
      }
    } catch {
      toast.error("Unable to verify email");
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault()
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

  // ✅ Show skeleton while app loads auth state
  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="100vh" overflow="hidden">
        <Skeleton height="320px" width="400px" borderRadius="md" />
      </Box>
    )
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" h="100vh" overflow="hidden">
      <Card w="full" maxW="md">
        <CardBody>
          <Stack spacing={4} as="form" onSubmit={step === "password" ? handleLogin : (e) => e.preventDefault()}>
            <Heading size="md">Login</Heading>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoFocus
              />
            </FormControl>

            {/* ✅ Slide-in Password Section */}
            <AnimatePresence>
              {step === "password" && (
                <MotionBox
                  key="password-input"
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.25 }}
                >
                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <HStack>
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange}
                      />
                      <Button onClick={() => setShowPassword(v => !v)} variant="ghost" px={2}>
                        {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      </Button>
                    </HStack>
                  </FormControl>
                </MotionBox>
              )}
            </AnimatePresence>

            {/* 75% Continue / Sign In + 25% Clear */}
            <HStack spacing={3}>
              {step === "email" ? (
                <>
                  <Button w="75%" colorScheme="blue" isLoading={busy} onClick={verifyEmail}>
                    Continue
                  </Button>
                  <Button w="25%" variant="outline" onClick={clearEmail}>
                    Clear
                  </Button>
                </>
              ) : (
                <>
                  <Button w="75%" type="submit" colorScheme="blue" isLoading={busy}>
                    Sign In
                  </Button>
                  <Button w="25%" variant="outline" onClick={clearPassword}>
                    Clear
                  </Button>
                </>
              )}
            </HStack>

            <Text fontSize="sm">
              New here?{" "}
              <Link as={RouterLink} to="/register" color="blue.500">
                Create an account
              </Link>
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  )
}
