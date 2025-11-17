import { Box, Flex, HStack, Spacer, Tooltip, IconButton } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { FiLogOut, FiHome, FiList } from "react-icons/fi";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, token, logout, photo } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
  }

  return (
    <Box as="nav" borderBottom="1px" borderColor="gray.200" px={4} py={3}>
      <Flex align="center" maxW="6xl" mx="auto" gap={4}>

        {/* 💰 Previous Icon With Tooltip */}
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

        <HStack spacing={4} align="center">
          {token && (
            <>
              {/* Dashboard Icon */}
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

              {/* Expenses Icon */}
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

              {/* Profile Initials */}
              {/* Profile Photo or Initials */}
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

              {/* Logout Icon */}
              <Tooltip label="Logout" hasArrow>
                <IconButton
                  size="sm"
                  icon={<FiLogOut />}
                  aria-label="Logout"
                  variant="ghost"
                  onClick={handleLogout}
                />
              </Tooltip>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
