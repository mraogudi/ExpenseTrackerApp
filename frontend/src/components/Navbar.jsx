// FULL UPDATED Navbar.jsx WITH:
// - Sticky Navbar
// - Session Expiry Modal
// - Logout Confirmation Modal
// - Timer Resume Fix
// - Improved Logout Button Styling

import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  HStack,
  Spacer,
  Tooltip,
  IconButton,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { FiHome, FiList } from "react-icons/fi";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, token, logout, photo } = useAuth();
  const navigate = useNavigate();

  const SESSION_LIMIT_MINUTES = 10;

  const [remainingTime, setRemainingTime] = useState("");
  const [sessionTrigger, setSessionTrigger] = useState(0);

  // Session Expired Modal
  const {
    isOpen: isSessionOpen,
    onOpen: openSessionModal,
    onClose: closeSessionModal,
  } = useDisclosure();

  const [sessionExpired, setSessionExpired] = useState(false);

  // Logout Confirmation Modal
  const {
    isOpen: isLogoutOpen,
    onOpen: openLogoutModal,
    onClose: closeLogoutModal,
  } = useDisclosure();

  const performLogout = () => {
    logout();
    closeLogoutModal();
    closeSessionModal();
    localStorage.clear();
    navigate("/login");
  };

  const handleResume = () => {
    localStorage.setItem("loginTime", Date.now());
    setSessionExpired(false);
    setSessionTrigger((prev) => prev + 1); // restart timer
    closeSessionModal();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Session timer effect
  useEffect(() => {
    if (!token) return;

    let loginTime = localStorage.getItem("loginTime");
    if (!loginTime) {
      localStorage.setItem("loginTime", Date.now());
      loginTime = Date.now();
    }

    const interval = setInterval(() => {
      const storedLoginTime = parseInt(localStorage.getItem("loginTime"), 10);
      const sessionDuration = SESSION_LIMIT_MINUTES * 60;
      const elapsedSeconds = Math.floor((Date.now() - storedLoginTime) / 1000);
      const left = sessionDuration - elapsedSeconds;

      if (left <= 0) {
        clearInterval(interval);
        setSessionExpired(true);
        openSessionModal();
      } else {
        setRemainingTime(formatTime(left));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [token, sessionTrigger]);

  const getUserInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    if (names.length === 1) return name.slice(0, 2).toUpperCase();
    return (
      names[0].slice(0, 1).toUpperCase() +
      names[1].slice(0, 1).toUpperCase()
    );
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  return (
    <>
      {/* Sticky Navbar */}
      <Box
        as="nav"
        position="sticky"
        top="0"
        zIndex="1000"
        bg="white"
        borderBottom="1px"
        borderColor="gray.200"
        px={4}
        py={3}
      >
        <Flex align="center" maxW="6xl" mx="auto" gap={4}>
          <Tooltip label="Expense Tracker" hasArrow>
            <Box
              as={RouterLink}
              to="/"
              fontSize="xl"
              cursor="pointer"
              _hover={{ transform: "scale(1.1)" }}
              transition="0.2s"
            >
              💰
            </Box>
          </Tooltip>

          <Spacer />

          <HStack spacing={6} align="center">
            {token && (
              <>
                {/* Dashboard */}
                <Tooltip label="Dashboard" hasArrow>
                  <IconButton
                    as={RouterLink}
                    to="/dashboard"
                    size="sm"
                    icon={<FiHome />}
                    aria-label="Dashboard"
                    variant="ghost"
                  />
                </Tooltip>

                {/* Expenses */}
                <Tooltip label="Expenses" hasArrow>
                  <IconButton
                    as={RouterLink}
                    to="/expenses"
                    size="sm"
                    icon={<FiList />}
                    aria-label="Expenses"
                    variant="ghost"
                  />
                </Tooltip>

                {/* Profile Photo */}
                <Tooltip label={user?.name} hasArrow>
                  <Box cursor="pointer" onClick={handleProfile}>
                    {photo ? (
                      <img
                        src={photo}
                        alt="Profile"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Box
                        bg="blue.500"
                        color="white"
                        fontWeight="bold"
                        borderRadius="full"
                        w="32px"
                        h="32px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="sm"
                      >
                        {getUserInitials(user?.name)}
                      </Box>
                    )}
                  </Box>
                </Tooltip>

                {/* Time + Logout Section */}
                <Box textAlign="center" minW="60px">
                  <Text fontSize="lg" fontWeight="bold" color="red.500">
                    {remainingTime}
                  </Text>

                  {/* Logout button with border */}
                  <Box
                    as="button"
                    fontSize="xs"
                    mt={1}
                    color="blue.600"
                    fontWeight="bold"
                    border="1px solid #2563eb"
                    px={2}
                    py={1}
                    borderRadius="6px"
                    _hover={{ bg: "blue.50" }}
                    onClick={openLogoutModal}
                  >
                    Logout
                  </Box>
                </Box>
              </>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* SESSION EXPIRED MODAL */}
      <Modal isOpen={isSessionOpen} onClose={closeSessionModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Session Expired</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            Your session has expired due to inactivity.<br />
            Would you like to continue or logout?
          </ModalBody>

          <ModalFooter justifyContent="flex-end">
            <Button variant="outline" mr={3} onClick={performLogout}>
              Logout
            </Button>
            <Button colorScheme="blue" onClick={handleResume}>
              Resume Session
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* LOGOUT CONFIRMATION MODAL */}
      <Modal isOpen={isLogoutOpen} onClose={closeLogoutModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Logout</ModalHeader>
          <ModalCloseButton />

          <ModalBody>Are you sure you want to logout?</ModalBody>

          <ModalFooter justifyContent="flex-end">
            <Button variant="outline" mr={3} onClick={closeLogoutModal}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={performLogout} border="1px solid #ef230cff" backgroundColor="white" color="red.500" _hover={{ backgroundColor: "red", color: "white"}}  >
              Logout
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
