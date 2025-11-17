import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Spinner,
  Text,
  Flex,
  Spacer,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import useAuth from "../hooks/useAuth";
import expenseService from "../services/expenseService";
import { saveAs } from "file-saver";

import { Pie, Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

export default function Dashboard() {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [summary, setSummary] = useState({
    totalSpent: 0,
    highestCategory: null,
    avgMonthly: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [monthly, categories, summaryData] = await Promise.all([
        expenseService.getMonthlyExpenses(user.id),
        expenseService.getCategoryExpenses(user.id),
        expenseService.getSummary(user.id),
      ]);

      setMonthlyData(monthly);
      setCategoryData(categories);
      setSummary(summaryData);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    const blob = await expenseService.exportCSV(user.id);
    saveAs(blob, "expenses.csv");
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box maxW="7xl" mx="auto" p={6}>
      {/* HEADER WITH DOWNLOAD ICON */}
      <Flex align="center" mb={8}>
        <Heading size="lg">
          Welcome, {user?.name || user?.email} 👋
        </Heading>

        <Spacer />

        <Tooltip label="Export Data" placement="left" hasArrow>
          <Box
            as="span"
            cursor="pointer"
            onClick={downloadCSV}
            p={2}
            _hover={{ color: "blue.500" }}
          >
            <Icon as={DownloadIcon} boxSize={6} />
          </Box>
        </Tooltip>
      </Flex>

      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card shadow="sm">
          <CardBody textAlign="center">
            <Heading size="md">₹{summary.totalSpent ?? 0}</Heading>
            <Text>Total Spent</Text>
          </CardBody>
        </Card>

        <Card shadow="sm">
          <CardBody textAlign="center">
            <Heading size="md">{summary.highestCategory?.category ?? "—"}</Heading>
            <Text>Top Category</Text>
          </CardBody>
        </Card>

        <Card shadow="sm">
          <CardBody textAlign="center">
            <Heading size="md">₹{summary.avgMonthly ?? 0}</Heading>
            <Text>Avg Monthly Spend</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        {/* Pie Chart */}
        <Card shadow="sm" borderRadius="lg" height="300px">
          <CardBody>
            <Heading size="md" mb={4} textAlign="center">
              Monthly Expense Overview
            </Heading>

            <Box height="200px">
              {monthlyData.length === 0 ? (
                <Text textAlign="center" color="gray.500">No Data Available</Text>
              ) : (
                <Pie
                  data={{
                    labels: monthlyData.map((m) => m.month),
                    datasets: [
                      {
                        data: monthlyData.map((m) => m.total),
                        backgroundColor: [
                          "#4C6FFF",
                          "#FF6B6B",
                          "#FFD93D",
                          "#6BCB77",
                          "#A66BFF",
                          "#FF922B",
                        ],
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
              )}
            </Box>
          </CardBody>
        </Card>

        {/* Bar Chart */}
        <Card shadow="sm" borderRadius="lg" height="300px">
          <CardBody>
            <Heading size="md" mb={4} textAlign="center">
              Expense Trend by Category
            </Heading>

            <Box height="200px">
              {categoryData.length === 0 ? (
                <Text textAlign="center" color="gray.500">No Data Available</Text>
              ) : (
                <Bar
                  data={{
                    labels: categoryData.map((c) => c.category),
                    datasets: [
                      {
                        label: "Amount Spent",
                        data: categoryData.map((c) => c.amount),
                        backgroundColor: "rgba(76,111,255,0.7)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { type: "category" },
                      y: { beginAtZero: true },
                    },
                  }}
                />
              )}
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
