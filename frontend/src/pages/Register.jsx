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
  useToast
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function Register() {
  const { register, token } = useAuth()
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation();
  const prefilledEmail = location.state?.email || "";
  const [form, setForm] = useState({ name: '', email: prefilledEmail, password: '' })

  // If already logged in → send to dashboard
  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true })
  }, [token, navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const response = await register(form.name.trim(), form.email.trim(), form.password)
      if (response.status === 200 || response.status === 201) {
        toast({
        title: 'Account Created',
        description: `Welcome ${user?.name || user?.email}!`,
        status: 'success',
      })
      navigate('/dashboard', { replace: true })
      } else {
        const msg = response.data?.message || 'Registration failed'
        toast({ title: 'Error', description: msg, status: 'error' })
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed'
      toast({ title: 'Error', description: msg, status: 'error' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Box display="grid" placeItems="center" minH="calc(100vh - 64px)" p={4}>
      <Card w="full" maxW="md" as="form" onSubmit={handleSubmit}>
        <CardBody>
          <Stack spacing={4}>
            <Heading size="md">Create Account</Heading>

            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input name="name" value={form.name} onChange={handleChange} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={!!prefilledEmail}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
              />
            </FormControl>

            <Button type="submit" colorScheme="blue" isLoading={busy}>
              Create Account
            </Button>

            <Text fontSize="sm" textAlign="center">
              Already have an account?{' '}
              <Link as={RouterLink} to="/login" color="blue.500">
                Sign in
              </Link>
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  )
}

