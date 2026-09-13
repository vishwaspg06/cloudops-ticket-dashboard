import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tickets");
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const createTicket = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/tickets", {
        title,
        description,
        priority,
      });

      setTitle("");
      setDescription("");
      setPriority("Medium");

      await fetchTickets();
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const resolveTicket = async (ticket) => {
    try {
      await axios.put(
        `http://localhost:5000/api/tickets/${ticket.id}`,
        {
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          status: "Resolved",
        }
      );

      await fetchTickets();
    } catch (error) {
      console.error("Error resolving ticket:", error);
    }
  };

  const deleteTicket = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tickets/${id}`);
      await fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((ticket) => ticket.status === "Open").length;
    const resolved = tickets.filter(
      (ticket) => ticket.status === "Resolved"
    ).length;

    return { total, open, resolved };
  }, [tickets]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">DevOps Incident Management</p>
          <h1>CloudOps Dashboard</h1>
          <p className="subtitle">
            Track, prioritize, and resolve operational incidents.
          </p>
        </div>

        <div className="status-pill">System Online</div>
      </header>

      <main className="container">
        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Tickets</span>
            <strong>{stats.total}</strong>
          </div>

          <div className="stat-card">
            <span>Open</span>
            <strong>{stats.open}</strong>
          </div>

          <div className="stat-card">
            <span>Resolved</span>
            <strong>{stats.resolved}</strong>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="section-label">Create Incident</p>
              <h2>New Ticket</h2>
            </div>
          </div>

          <form className="ticket-form" onSubmit={createTicket}>
            <input
              type="text"
              placeholder="Ticket title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Ticket"}
            </button>
          </form>
        </section>

        <section className="tickets-section">
          <div className="tickets-header">
            <div>
              <p className="section-label">Operations Queue</p>
              <h2>Active Tickets</h2>
            </div>

            <span className="ticket-count">{tickets.length} tickets</span>
          </div>

          {tickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <h3>No incidents in the queue</h3>
              <p>Create a ticket to start tracking an operational issue.</p>
            </div>
          ) : (
            <div className="ticket-grid">
              {tickets.map((ticket) => (
                <article className="ticket-card" key={ticket.id}>
                  <div className="ticket-card-top">
                    <div>
                      <span className="ticket-id">INC-{ticket.id}</span>
                      <h3>{ticket.title}</h3>
                    </div>

                    <span
                      className={`priority-badge priority-${ticket.priority.toLowerCase()}`}
                    >
                      {ticket.priority}
                    </span>
                  </div>

                  <p className="ticket-description">
                    {ticket.description || "No description provided."}
                  </p>

                  <div className="ticket-meta">
                    <span
                      className={`status-badge ${
                        ticket.status === "Resolved"
                          ? "status-resolved"
                          : "status-open"
                      }`}
                    >
                      {ticket.status}
                    </span>

                    <span className="created-date">
                      {ticket.created_at || "Recently created"}
                    </span>
                  </div>

                  <div className="ticket-actions">
                    {ticket.status !== "Resolved" && (
                      <button
                        className="resolve-btn"
                        onClick={() => resolveTicket(ticket)}
                      >
                        Resolve
                      </button>
                    )}

                    <button
                      className="delete-btn"
                      onClick={() => deleteTicket(ticket.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;