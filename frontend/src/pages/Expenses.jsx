import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Center,
  HStack,
  Input,
  Select,
  Card,
  CardBody,
  IconButton,
  Tooltip,
  useDisclosure,
  Tag,
  Flex,
  Button,
  VStack,
  Text,
  FormLabel,
} from "@chakra-ui/react";

import { AddIcon, EditIcon, DeleteIcon, CloseIcon, SearchIcon } from "@chakra-ui/icons";
import useAuth from "../hooks/useAuth";
import expenseService from "../services/expenseService";
import ExpenseFormModal from "./ExpenseFormModal";

export default function Expenses() {
  const ITEMS_PER_PAGE = 6;

  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const [loading, setLoading] = useState(true);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await expenseService.getExpenses(user.id);
      setExpenses(data || []);
      setFiltered(data || []);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    onOpen();
  };

  const handleEdit = async (exp) => {
    try {
      const data = await expenseService.fetchExpense(exp.id);
      setEditing(data);
      onOpen();
    } catch (err) {
      console.error("Failed to fetch expense:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await expenseService.deleteExpense(id);
      await loadExpenses();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let data = [...expenses];

    if (searchText.trim() !== "") {
      const q = searchText.trim().toLowerCase();
      data = data.filter((e) => (e.title || "").toLowerCase().includes(q));
    }

    if (category) {
      data = data.filter((e) => e.category === category);
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      data = data.filter((e) => new Date(e.date) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      data = data.filter((e) => new Date(e.date) <= to);
    }

    if (amountMin !== "") {
      data = data.filter((e) => Number(e.amount) >= Number(amountMin));
    }

    if (amountMax !== "") {
      data = data.filter((e) => Number(e.amount) <= Number(amountMax));
    }

    setFiltered(data);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchText("");
    setCategory("");
    setDateFrom("");
    setDateTo("");
    setAmountMin("");
    setAmountMax("");

    setFiltered(expenses);
    setPage(1);
  };

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "Food": return "green";
      case "Transport": return "blue";
      case "Entertainment": return "pink";
      case "Utilities": return "yellow";
      case "Health": return "red";
      case "General": return "purple";
      case "Other": return "gray";
      default: return "gray";
    }
  };

  return (
    <Box maxW="7xl" mx="auto" p={6}>
      {/* HEADER */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">My Expenses</Heading>

        <Tooltip label="Add Expense" hasArrow>
          <IconButton
            icon={<AddIcon />}
            colorScheme="teal"
            borderRadius="full"
            onClick={handleAdd}
          />
        </Tooltip>
      </Flex>

      {/* FILTER BAR */}
      <Card mb={6} shadow="md" borderRadius="xl">
        <CardBody>
          <Flex
            align="flex-start"
            gap={5}
            overflowX="auto"
            whiteSpace="nowrap"
            py={2}
            px={2}
          >

            {/* Search */}
            <Box minW="150px">
              <FormLabel fontSize="sm" mb={1}>Search</FormLabel>
              <Input
                placeholder="Search title..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                bg="white"
                shadow="sm"
              />
            </Box>

            {/* Category */}
            <Box minW="150px">
              <FormLabel fontSize="sm" mb={1}>Category</FormLabel>
              <Select
                placeholder="All"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                bg="white"
                shadow="sm"
              >
                <option value="">All</option>
                <option value="General">General</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Utilities">Utilities</option>
                <option value="Health">Health</option>
                <option value="Other">Other</option>
              </Select>
            </Box>

            {/* Date From */}
            <Box minW="150px">
              <FormLabel fontSize="sm" mb={1}>From Date</FormLabel>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                bg="white"
                shadow="sm"
              />
            </Box>

            {/* Date To */}
            <Box minW="150px">
              <FormLabel fontSize="sm" mb={1}>To Date</FormLabel>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                bg="white"
                shadow="sm"
              />
            </Box>

            {/* Amount Min */}
            <Box minW="110px">
              <FormLabel fontSize="sm" mb={1}>Min</FormLabel>
              <Input
                type="number"
                placeholder="Min Amount"
                value={amountMin}
                onChange={(e) => setAmountMin(e.target.value)}
                min="0"
                step="0.01"
                bg="white"
                shadow="sm"
              />
            </Box>

            {/* Amount Max */}
            <Box minW="110px">
              <FormLabel fontSize="sm" mb={1}>Max</FormLabel>
              <Input
                type="number"
                placeholder="Max Amount"
                value={amountMax}
                onChange={(e) => setAmountMax(e.target.value)}
                min="0"
                step="0.01"
                bg="white"
                shadow="sm"
              />
            </Box>

            {/* Search + Reset */}
            <HStack spacing={3} ml={2} mr={4} pt="24px">
              <Tooltip label="Search">
                <IconButton
                  icon={<SearchIcon />}
                  colorScheme="teal"
                  aria-label="Search"
                  onClick={applyFilters}
                />
              </Tooltip>

              <Tooltip label="Reset">
                <IconButton
                  icon={<CloseIcon />}
                  colorScheme="gray"
                  aria-label="Reset Filters"
                  onClick={resetFilters}
                />
              </Tooltip>
            </HStack>

          </Flex>
        </CardBody>
      </Card>

      {/* TABLE */}
      <Box overflowX="auto" shadow="md" borderRadius="xl" bg="white">
        <Table
          variant="simple"
          size="md"
          sx={{
            "tbody tr:nth-of-type(odd)": { bg: "gray.50" },
            "tbody tr:nth-of-type(even)": { bg: "gray.100" },
          }}
        >
          <Thead bg="gray.200">
            <Tr>
              <Th>Title</Th>
              <Th>Date</Th>
              <Th isNumeric>Amount</Th>
              <Th>Category</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>

          <Tbody>
            {paginated.length === 0 ? (
              <Tr>
                <Td colSpan={5}>
                  <Center py={6}>
                    <VStack>
                      <Text>No expenses found.</Text>
                      <Button size="sm" onClick={resetFilters}>
                        Show all expenses
                      </Button>
                    </VStack>
                  </Center>
                </Td>
              </Tr>
            ) : (
              paginated.map((exp) => (
                <Tr key={exp.id}>
                  <Td>{exp.title}</Td>
                  <Td>{new Date(exp.date).toLocaleDateString()}</Td>
                  <Td isNumeric fontWeight="bold">₹{exp.amount}</Td>
                  <Td>
                    <Tag px={3} borderRadius="full" colorScheme={getCategoryColor(exp.category)}>
                      {exp.category}
                    </Tag>
                  </Td>
                  <Td>
                    <HStack>
                      <IconButton
                        icon={<EditIcon />}
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => handleEdit(exp)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDelete(exp.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>

        {/* PAGINATION */}
        {filtered.length > ITEMS_PER_PAGE && (
          <HStack justify="center" mt={6} p={4}>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                size="sm"
                onClick={() => setPage(i + 1)}
                variant={page === i + 1 ? "solid" : "outline"}
                colorScheme={page === i + 1 ? "teal" : "gray"}
                borderRadius="full"
              >
                {i + 1}
              </Button>
            ))}
          </HStack>
        )}
      </Box>

      <ExpenseFormModal
        isOpen={isOpen}
        onClose={onClose}
        refresh={loadExpenses}
        expense={editing}
      />
    </Box>
  );
}
