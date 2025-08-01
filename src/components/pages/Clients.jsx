import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
import ClientCard from "@/components/molecules/ClientCard";
import ClientForm from "@/components/molecules/ClientForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import clientService from "@/services/api/clientService";

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredClients = clients.filter(client => {
    if (statusFilter === "All") return true;
    return client.status === statusFilter;
  });

  const loadClients = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await clientService.getAll();
      setClients(data);
    } catch (err) {
      console.error("Failed to load clients:", err);
      setError("Failed to load clients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleCreateClient = async (clientData) => {
    try {
      const newClient = await clientService.create(clientData);
      setClients(prev => [...prev, newClient]);
      setShowModal(false);
      toast.success("Client created successfully!");
    } catch (err) {
      console.error("Failed to create client:", err);
      toast.error("Failed to create client. Please try again.");
    }
  };

  const handleEditClient = async (clientData) => {
    try {
      const updatedClient = await clientService.update(editingClient.Id, clientData);
      setClients(prev => 
        prev.map(client => 
          client.Id === editingClient.Id ? updatedClient : client
        )
      );
      setShowModal(false);
      setEditingClient(null);
      toast.success("Client updated successfully!");
    } catch (err) {
      console.error("Failed to update client:", err);
      toast.error("Failed to update client. Please try again.");
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await clientService.delete(clientId);
        setClients(prev => prev.filter(client => client.Id !== clientId));
        toast.success("Client deleted successfully!");
      } catch (err) {
        console.error("Failed to delete client:", err);
        toast.error("Failed to delete client. Please try again.");
      }
    }
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
setEditingClient(null);
  };

  const handleViewClient = (clientId) => {
    navigate(`/clients/${clientId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients</h1>
            <p className="text-gray-600">Manage your client relationships</p>
          </div>
        </div>
        <Loading type="list" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients</h1>
            <p className="text-gray-600">Manage your client relationships</p>
          </div>
        </div>
        <Error message={error} onRetry={loadClients} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Clients</h1>
          <p className="text-gray-600">Manage your client relationships</p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Client
        </Button>
      </div>

      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <ApperIcon name="Filter" size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        </div>
        <div className="flex items-center gap-2">
          {["All", "Active", "Inactive", "Prospect"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                statusFilter === status
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {status}
              {status !== "All" && (
                <span className="ml-1 text-xs opacity-75">
                  ({clients.filter(c => c.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {clients.length === 0 ? (
        <Empty
          icon="Users"
          title="No clients yet"
          description="Start building your client base by adding your first client."
          actionLabel="Add Client"
          onAction={openCreateModal}
        />
      ) : (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
<ClientCard
              key={client.Id}
              client={client}
              onEdit={openEditModal}
              onDelete={handleDeleteClient}
              onView={handleViewClient}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingClient ? "Edit Client" : "Add New Client"}
        className="max-w-lg"
      >
        <ClientForm
          client={editingClient}
          onSubmit={editingClient ? handleEditClient : handleCreateClient}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default Clients;