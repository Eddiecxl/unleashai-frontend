import React, { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import "./UserReports.css";

function UserReports() {
  const [sendAlert, setsendAlert] = useState(null);
  const [hideForm, setHideForm] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setError] = useState(null);
  const [userReportInput, setUserReportInput] = useState("");
  const [modalContent, setModalContent] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null); // Track the expanded row
  const [sortConfig, setSortConfig] = useState({
    key: "reportedAt",
    direction: "asc",
  }); // Default sorting
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL


  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/report`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchReports(); // Call fetchConversations when the button is clicked
  };

  const toggleRowExpansion = (reportID) => {
    setExpandedRow((prev) => (prev === reportID ? null : reportID));
  };

  const sortedReports = () => {
    const sortedData = [...reports];
    const { key, direction } = sortConfig;

    sortedData.sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Handle date columns
      if (key === "reportedAt" || key === " dAt") {
        aValue = aValue ? new Date(aValue) : null;
        bValue = bValue ? new Date(bValue) : null;
      }

      // Handle resolvedStat as boolean
      if (key === "resolvedStat") {
        aValue = aValue ? 1 : 0; // Convert boolean to numeric for sorting
        bValue = bValue ? 1 : 0;
      }

      // Handle null/undefined values
      if (aValue === null || aValue === undefined)
        return direction === "asc" ? 1 : -1;
      if (bValue === null || bValue === undefined)
        return direction === "asc" ? -1 : 1;

      // Perform comparison
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;

      return 0; // Equal values
    });

    return sortedData;
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc", // Toggle direction
    }));
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredReports = reports.filter(
    (report) => report.reportID.toString().includes(searchTerm) // Filter by reportID
  );

  const highlightMatch = (text) => {
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.toString().replace(regex, (match) => `<mark>${match}</mark>`);
  };

  const handleDelete = async (reportID) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/report/${reportID}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Report deleted successfully.");
        fetchReports();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error deleting report: ${error.message}`);
      }
    } catch (err) {
      console.error("Error deleting report:", err.message);
    }
  };

  const handleResolve = async (reportID) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/report/resolve/${reportID}`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        alert("Report resolved successfully.");
        fetchReports();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error resolving report: ${error.message}`);
      }
    } catch (err) {
      console.error("Error resolving report:", err.message);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const openModal = (content) => setModalContent(content);
  const closeModal = () => setModalContent(null);

  // Helper function to convert UTC time to NZT
  const convertToNZT = (utcTime) => {
    const date = new Date(utcTime);
    return date.toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" });
  };

  const handleSendEmail = async (e, username, email) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/report/send-Report-by-email`,
        {
          method: "POST",
          body: JSON.stringify({
            username: username,
            email: email,
            content: userReportInput,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setTimeout(() => {
          setsendAlert({
            type: "success",
            message: "Email send successfully!",
          });
          setTimeout(() => {
            setUserReportInput("");
            setsendAlert(null); // Clear alert after delay
          }, 2000); // Show alert for 2 seconds
        }, 1000);
      } else {
        const errorData = await response.text();
        setsendAlert({ type: "error", message: `Error: ${errorData}` });
        setTimeout(() => {
          setsendAlert(null); // Clear alert after delay
        }, 3000); // Show alert for 2 seconds
      }
    } catch (error) {
      setsendAlert({
        type: "error",
        message: "Error connecting to the server.",
      });
    }
  };

  return (
    <div className="admin-content user-reports">
      <h1>User Reports</h1>

      {/* Search Input */}
      <div className="search-container">
        <label htmlFor="search-report-id">Search by Report ID:</label>
        <input
          id="search-report-id"
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Enter Report ID"
        />
      </div>

      <button onClick={handleRefresh} className="refresh-button">
        🔄 Refresh
      </button>

      {/* Show alert for success or error */}
      {sendAlert && (
        <div
          className={`alert-container ${
            sendAlert.type === "success" ? "alert-center" : ""
          }`}
        >
          <Alert severity={sendAlert.type}>{sendAlert.message}</Alert>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort("reportID")}>
                  Report ID{" "}
                  {sortConfig.key === "reportID" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("username")}>
                  Username{" "}
                  {sortConfig.key === "username" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("email")}>
                  Email{" "}
                  {sortConfig.key === "email" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("reportType")}>
                  Type{" "}
                  {sortConfig.key === "reportType" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th>Content</th>
                <th onClick={() => handleSort("reportedAt")}>
                  Reported At{" "}
                  {sortConfig.key === "reportedAt" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("resolvedStat")}>
                  Status{" "}
                  {sortConfig.key === "resolvedStat" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("resolvedAt")}>
                  Resolved At{" "}
                  {sortConfig.key === "resolvedAt" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedReports()
                .filter((report) =>
                  report.reportID.toString().includes(searchTerm)
                ) // Apply filtering here
                .map((report) => (
                  <>
                    <tr
                      key={report.reportID}
                      onClick={() => toggleRowExpansion(report.reportID)}
                      className={
                        expandedRow === report.reportID ? "expanded-row" : ""
                      }
                    >
                      <td>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(report.reportID),
                          }}
                        ></span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering row expansion
                            navigator.clipboard.writeText(report.reportID);
                            alert(`Copied Report ID: ${report.reportID}`); // Optional user feedback
                          }}
                          className="copy-icon"
                          title="Copy Report ID"
                        >
                          ❏
                        </button>
                      </td>

                      <td>{report.username}</td>
                      <td>{report.email}</td>
                      <td>{report.reportType || "N/A"}</td>
                      <td>
                        {report.reportContent &&
                        report.reportContent.length > 50 ? (
                          <>
                            {report.reportContent.substring(0, 50)}...
                            <button
                              onClick={() => openModal(report.reportContent)}
                            >
                              Read More
                            </button>
                          </>
                        ) : (
                          report.reportContent || "No content"
                        )}
                      </td>
                      <td>
                        {report.reportedAt
                          ? convertToNZT(report.reportedAt)
                          : "N/A"}
                      </td>
                      <td>{report.resolvedStat ? "Resolved" : "Pending"}</td>
                      <td>
                        {report.resolvedAt
                          ? convertToNZT(report.resolvedAt)
                          : "N/A"}
                      </td>
                      <td>
                        {!report.resolvedStat && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal({
                                title: "Resolve Report",
                                content: `Are you sure you want to resolve the report "${report.reportID}"?`,
                                action: () => handleResolve(report.reportID),
                              });
                            }}
                            className="resolve-button"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal({
                              title: "Delete Report",
                              content: `Are you sure you want to delete the report "${report.reportID}"?`,
                              action: () => handleDelete(report.reportID),
                            });
                          }}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {expandedRow === report.reportID && (
                      <tr className="expanded-details">
                        <td colSpan="9">
                          <div className="details-container">
                            <p>
                              <strong>Report ID:</strong> {report.reportID}{" "}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(
                                    report.reportID
                                  );
                                  alert(`Copied Report ID: ${report.reportID}`);
                                }}
                                className="copy-icon"
                                title="Copy Report ID"
                              >
                                ❏
                              </button>
                            </p>
                            <p>
                              <strong>Username:</strong> {report.username}
                            </p>
                            <p>
                              <strong>Email:</strong> {report.email}
                            </p>
                            <p>
                              <strong>Type:</strong>{" "}
                              {report.reportType || "N/A"}
                            </p>
                            <p
                              style={{
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                                lineHeight: "1.7",
                              }}
                            >
                              <strong>Content:</strong>{" "}
                              {report.reportContent || "No content"}
                            </p>
                            <p>
                              <strong>Reported At:</strong>{" "}
                              {report.reportedAt
                                ? convertToNZT(report.reportedAt)
                                : "N/A"}
                            </p>
                            <p>
                              <strong>Resolved At:</strong>{" "}
                              {report.resolvedAt
                                ? convertToNZT(report.resolvedAt)
                                : "N/A"}
                            </p>
                            <p>
                              <strong>Status:</strong>{" "}
                              <span
                                style={{
                                  color: report.resolvedStat
                                    ? "#10b981"
                                    : "#f59e0b", // Green for Resolved, Orange for Pending
                                  fontWeight: "bold",
                                }}
                              >
                                {report.resolvedStat ? "Resolved" : "Pending"}
                              </span>
                            </p>
                            <br />
                            <strong>Reply to {report.email}</strong>
                            <form
                              className="user-report-container"
                              onSubmit={(e) =>
                                handleSendEmail(
                                  e,
                                  report.username,
                                  report.email
                                )
                              }
                            >
                              <textarea
                                className="user-report-input"
                                name="userReportInput"
                                rows={"12"}
                                value={userReportInput}
                                onChange={(e) =>
                                  setUserReportInput(e.target.value)
                                }
                              />
                              <button className="sendEmail" type="Submit">
                                Send
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
            </tbody>
          </table>

          {modalContent && (
            <div className="modal">
              <div className="modal-content">
                <h2>{modalContent.title}</h2>
                <p>{modalContent.content}</p>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <button
                    onClick={closeModal}
                    style={{ marginRight: "10px" }}
                    className="delete-button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={modalContent.action}
                    className="resolve-button2"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UserReports;
