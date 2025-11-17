import { useEffect, useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, Button, FormControl,
  FormLabel, Input, Select, SimpleGrid, ModalCloseButton, Flex
} from "@chakra-ui/react";
import expenseService from "../services/expenseService";
import useAuth from "../hooks/useAuth";

export default function ExpenseFormModal({ isOpen, onClose, refresh, expense }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    date: ""
  });

  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date?.split("T")[0]
      });
    } else {
      setForm({ title: "", amount: "", category: "", date: "" });
    }
  }, [expense]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClear = () => {
    if (expense) {
      setForm({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date?.split("T")[0]
      });
    } else {
      setForm({ title: "", amount: "", category: "", date: "" });
    }
  };

  const handleSubmit = async () => {
    const payload = { ...form, user_id: user.id };

    if (expense) {
      await expenseService.updateExpense(expense.id, payload);
    } else {
      await expenseService.createExpense(payload);
    }

    refresh();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="600px">
        
        <ModalHeader>
          {expense ? "Edit Expense" : "Add Expense"}
        </ModalHeader>

        {/* Top-Right Close Icon */}
        <ModalCloseButton />

        <ModalBody pb={6}>
          {/* Row 1 — Title + Amount */}
          <SimpleGrid columns={2} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input name="title" value={form.title} onChange={handleChange} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Amount</FormLabel>
              <Input
                type="number"
                step="0.01"
                name="amount"
                value={form.amount}
                onChange={handleChange}
              />
            </FormControl>
          </SimpleGrid>

          {/* Row 2 — Category + Date */}
          <SimpleGrid columns={2} spacing={4} mt={4}>
            <FormControl>
              <FormLabel>Category</FormLabel>
              <Select name="category" value={form.category} onChange={handleChange}>
                <option value="">Select Category</option>
                <option value="General">General</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Utilities">Utilities</option>
                <option value="Health">Health</option>
                <option value="Other">Other</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </FormControl>
          </SimpleGrid>
        </ModalBody>

        <ModalFooter>
          <Flex width="100%" gap={3}>
            
            {/* Close 20% */}
            <Button
              width="20%"
              colorScheme="red"
              onClick={onClose}
            >
              Close
            </Button>

            {/* Clear 20% */}
            <Button
              width="20%"
              onClick={handleClear}
              colorScheme="gray"
            >
              Clear
            </Button>

            {/* Submit 60% */}
            <Button
              width="60%"
              colorScheme="blue"
              onClick={handleSubmit}
            >
              {expense ? "Update" : "Add"}
            </Button>

          </Flex>
        </ModalFooter>

      </ModalContent>
    </Modal>
  );
}
