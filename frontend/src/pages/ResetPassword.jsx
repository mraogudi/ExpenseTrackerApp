import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  HStack,
  Stack,
  Text,
  Center,
  Icon,
  Link,
  InputGroup,
  InputRightElement,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  ViewIcon,
  ViewOffIcon,
  WarningTwoIcon,
  CheckCircleIcon,
} from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { toast } from "../utils/toast";
import {
  useSearchParams,
  useNavigate,
  Link as RouterLink,
} from "react-router-dom";
import profileService from "../services/profileService";
import { getPasswordStrength } from "../utils/passwordStrength";

const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionIcon = motion(Icon);

/* 🔹 Bullet requirement row */
const RequirementRow = ({ ok, label }) => {
  const color = ok ? "green.400" : "gray.500";
  const icon = ok ? "✔" : "•";
  return (
    <HStack spacing={2}>
      <Text fontWeight="bold" color={color}>
        {icon}
      </Text>
      <Text color={color}>{label}</Text>
    </HStack>
  );
};

/* 🔹 Segmented Strength Bar */
const StrengthBar = ({ score }) => {
  const segments = 4;

  return (
    <HStack spacing={1} mt={2}>
      {[...Array(segments)].map((_, i) => (
        <Box
          key={i}
          h="6px"
          w="full"
          borderRadius="md"
          bg={
            i < score
              ? score <= 1
                ? "red.400"
                : score === 2
                ? "yellow.400"
                : score === 3
                ? "blue.400"
                : "green.400"
              : "gray.300"
          }
          transition="0.3s"
        />
      ))}
    </HStack>
  );
};

export default function ResetPassword() {
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({ pass: false, confirm: false });

  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [isTokenValid, setIsTokenValid] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState(5);

  const cardBg = useColorModeValue("white", "gray.800");
  const titleColor = useColorModeValue("blue.600", "blue.300");

  /* Validate token */
  useEffect(() => {
    if (!token || token.length < 10) setIsTokenValid(false);
  }, [token]);

  /* Countdown for expired token */
  useEffect(() => {
    if (!isTokenValid) {
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            navigate("/login");
            clearInterval(interval);
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTokenValid, navigate]);

  /* Password strength */
  const strength = getPasswordStrength(form.password);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const clearForm = () =>
    setForm({
      password: "",
      confirmPassword: "",
    });

  /* Countdown after success */
  useEffect(() => {
    if (resetSuccess) {
      const interval = setInterval(() => {
        setSuccessCountdown((c) => {
          if (c <= 1) {
            navigate("/login");
            clearInterval(interval);
          }
          return c - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [resetSuccess, navigate]);

  const handleReset = async () => {
    if (!form.password || !form.confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await profileService.resetPassword(token, form.password);
      setResetSuccess(true);
    } catch (e) {
      setIsTokenValid(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* TOKEN EXPIRED SCREEN */
  /* ------------------------------------------------------------------ */
  if (!isTokenValid) {
    return (
      <Center h="100vh">
        <Stack spacing={5} textAlign="center">
          <MotionIcon
            as={WarningTwoIcon}
            w={16}
            h={16}
            color="red.400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
          />

          <Heading size="lg" color="red.400">
            Token Expired
          </Heading>

          <Text color="gray.600">
            Your reset link is invalid or expired. <br />
            Redirecting in <b>{countdown}</b> seconds...
          </Text>

          <Button
            colorScheme="blue"
            w="60%"
            mx="auto"
            onClick={() => navigate("/login")}
          >
            Request New Link
          </Button>
        </Stack>
      </Center>
    );
  }

  /* ------------------------------------------------------------------ */
  /* SUCCESS SCREEN */
  /* ------------------------------------------------------------------ */
  if (resetSuccess) {
    return (
      <Center h="100vh">
        <Stack spacing={5} textAlign="center">
          <MotionIcon
            as={CheckCircleIcon}
            w={20}
            h={20}
            color="green.400"
            initial={{ scale: 0 }}
            animate={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
          />

          <Heading size="lg" color="green.400">
            Password Reset Successful!
          </Heading>

          <Text color="gray.600">
            Redirecting to login in <b>{successCountdown}</b> seconds...
          </Text>

          <Button
            colorScheme="blue"
            w="60%"
            mx="auto"
            onClick={() => navigate("/login")}
          >
            Go to Login Now
          </Button>
        </Stack>
      </Center>
    );
  }

  /* ------------------------------------------------------------------ */
  /* MAIN FORM */
  /* ------------------------------------------------------------------ */
  return (
    <Box display="flex" alignItems="center" justifyContent="center" h="100vh">
      <Card w="full" maxW="md" bg={cardBg} shadow="lg" borderRadius="xl">
        <CardBody>
          <Stack spacing={6}>
            <Heading size="md" color={titleColor}>
              Reset Your Password
            </Heading>

            {/* New Password */}
            <FormControl isRequired>
              <FormLabel>New Password</FormLabel>

              <InputGroup>
                <Input
                  type={show.pass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
                <InputRightElement>
                  <MotionButton
                    variant="ghost"
                    onClick={() => setShow({ ...show, pass: !show.pass })}
                    whileTap={{ scale: 0.85 }}
                  >
                    {show.pass ? <ViewOffIcon /> : <ViewIcon />}
                  </MotionButton>
                </InputRightElement>
              </InputGroup>

              {/* Segmented Strength Bar */}
              <StrengthBar score={strength.score} />

              {/* Requirements */}
              <Stack spacing={1} mt={2}>
                <RequirementRow
                  ok={form.password.length >= 8}
                  label="Minimum 8 characters"
                />
                <RequirementRow
                  ok={/[A-Z]/.test(form.password)}
                  label="Contains uppercase letter"
                />
                <RequirementRow
                  ok={/[0-9]/.test(form.password)}
                  label="Contains a number"
                />
                <RequirementRow
                  ok={/[^A-Za-z0-9]/.test(form.password)}
                  label="Contains a special symbol"
                />
              </Stack>
            </FormControl>

            {/* Confirm Password */}
            <FormControl isRequired>
              <FormLabel>Confirm Password</FormLabel>

              <InputGroup>
                <Input
                  type={show.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                <InputRightElement>
                  <MotionButton
                    variant="ghost"
                    whileTap={{ scale: 0.85 }}
                    onClick={() =>
                      setShow({ ...show, confirm: !show.confirm })
                    }
                  >
                    {show.confirm ? <ViewOffIcon /> : <ViewIcon />}
                  </MotionButton>
                </InputRightElement>
              </InputGroup>

              {/* Password Match Label */}
              {form.confirmPassword.length > 0 && (
                <Text
                  fontSize="sm"
                  mt={1}
                  fontWeight="semibold"
                  color={
                    form.password === form.confirmPassword
                      ? "green.400"
                      : "red.400"
                  }
                >
                  {form.password === form.confirmPassword
                    ? "Passwords match ✔"
                    : "Passwords do not match ✘"}
                </Text>
              )}
            </FormControl>

            {/* Buttons */}
            <HStack spacing={3}>
              <Button w="75%" colorScheme="blue" onClick={handleReset}>
                Reset Password
              </Button>
              <Button w="25%" variant="outline" onClick={clearForm}>
                Clear
              </Button>
            </HStack>

            <Link
              as={RouterLink}
              to="/login"
              color="blue.500"
              textAlign="center"
            >
              Back to Login
            </Link>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
}
