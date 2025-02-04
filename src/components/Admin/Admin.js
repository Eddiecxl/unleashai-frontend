import React, { useState, useEffect, useRef } from "react";
import "./Admin.css";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function Admin() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true); // New Loading State

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

  const [doughnutData, setDoughnutData] = useState({
    labels: ["Active Users", "Inactive Users"],
    datasets: [
      {
        data: [0, 0], // Initial placeholder values
        backgroundColor: ["#10b981", "#475569"],
      },
    ],
  });
  const [barChartData, setBarChartData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Daily User Logins",
        data: [0, 0, 0, 0, 0, 0, 0], // Initial placeholder values
        backgroundColor: "#10b981",
      },
    ],
  });
  const [categoryChartData, setCategoryChartData] = useState({
    labels: [], // Category labels
    datasets: [
      {
        label: "Category Counts",
        data: [], // Category counts
        backgroundColor: [
          "#1e293b",
          "#3b82f6",
          "#0ea5e9",
          "#22d3ee",
          "#06b6d4",
          "#0f766e",
          "#10b981",
          "#a3e635",
          "#eab308",
          "#ef4444",
        ],
        borderRadius: 8,
      },
    ],
  });

 // Optimized API Calls - Fetch Data Concurrently
 useEffect(() => {
  const controller = new AbortController();
  const signal = controller.signal;
  let isMounted = true; // Track if the component is active

  const fetchAllData = async () => {
    if (!isMounted) return; // Prevent execution if component unmounted
    try {
      setLoading(true); // Set loading at the start

      // Fetch data concurrently
      const [usersRes, loginRes, reportsRes, categoryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users/all-users`, { signal }),
        fetch(`${API_BASE_URL}/api/users/get-login-status`, { signal }),
        fetch(`${API_BASE_URL}/api/report`, { signal }),
        fetch(`${API_BASE_URL}/api/conversation-history/all-category`, { signal })
      ]);

      if (!isMounted) return; // Stop if unmounted

      // Parse JSON responses in parallel
      const [usersData, loginStatusData, reportsData, categoryData] = await Promise.all([
        usersRes.json(),
        loginRes.json(),
        reportsRes.json(),
        categoryRes.json()
      ]);

      if (!isMounted) return; // Prevent state updates on unmounted component

      // Batch state updates into a single render
      setUsers(usersData);
      setReports(reportsData);

      const activeUsers = usersData.filter(user => user.isLoggedIn).length;
      const inactiveUsers = usersData.length - activeUsers;
      setDoughnutData(prev => ({
        ...prev,
        datasets: [{ data: [activeUsers, inactiveUsers], backgroundColor: ["#10b981", "#475569"] }]
      }));

      const loginCounts = new Array(7).fill(0);
      loginStatusData.loginStatus.forEach(entry => {
        const dayIndex = getDayIndex(entry.dayOfWeek);
        if (dayIndex !== -1) loginCounts[dayIndex] = entry.loginCount;
      });

      setBarChartData(prev => ({
        ...prev,
        datasets: [{ label: "Daily User Logins", data: loginCounts, backgroundColor: "#10b981" }]
      }));

      const categories = categoryData.map(item => item.category);
      const counts = categoryData.map(item => item.count);
      setCategoryChartData(prev => ({
        ...prev,
        labels: categories,
        datasets: [{ ...prev.datasets[0], data: counts }]
      }));

    } catch (error) {
      if (error.name === "AbortError") {
        console.log("API call aborted.");
      } else {
        console.error("Error fetching admin data:", error);
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchAllData();

  return () => {
    isMounted = false; // Mark component as unmounted
    controller.abort(); // Cancel API calls on unmount
    console.log("Admin component unmounted, API calls stopped.");
  };
}, []);


  const getDayIndex = (day) => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return daysOfWeek.indexOf(day);
  };

  // Calculate new signups in the current month
  const getCurrentMonthSignups = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return users.filter((user) => {
      const signupDate = new Date(user.createdAt);
      return signupDate.getMonth() === currentMonth && signupDate.getFullYear() === currentYear;
    }).length;
  };

  return (
    <div className="admin-content admin-dashboard">
      <h1>Welcome to the Admin Dashboard</h1>
      <p>Use the sidebar to navigate to different sections.</p>

      {/* Info Boxes */}
      <div className="info-boxes">
        <div className="info-box">
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
        <div className="info-box">
          <h3>New Signups</h3>
          <p>{getCurrentMonthSignups()}</p>
        </div>
        <div className="info-box">
          <h3>Reports Pending</h3>
          <p>{reports.length}</p>
        </div>
      </div>

      {/* Daily Logins and User Status */}
      <div className="graphs">
        <div className="graph-container">
          <h3>Daily Logins</h3>
          <Bar data={barChartData} />
        </div>
        <div className="graph-container">
          <h3>User Status</h3>
          <Doughnut data={doughnutData} />
        </div>
      </div>

      {/* Category Count Bar Chart */}
      <div className="favorite-questions-section">
        <h2>Category Counts</h2>
        <p>
          This chart shows the count of each category in the conversation
          history.
        </p>
        <div className="favorite-questions-chart">
          <Bar
            data={categoryChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: (context) =>
                      `${context.label}: ${context.raw} messages`,
                  },
                },
                title: {
                  display: true,
                  text: "Category Counts",
                  font: {
                    size: 22,
                  },
                },
              },
              animation: {
                duration: 2000,
                easing: "easeOutBounce",
              },
              scales: {
                x: {
                  ticks: {
                    color: "#1e293b",
                  },
                  grid: {
                    color: "#e5e7eb",
                  },
                },
                y: {
                  ticks: {
                    color: "#1e293b",
                  },
                  grid: {
                    color: "#e5e7eb",
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
    
  );
}

export default Admin;
