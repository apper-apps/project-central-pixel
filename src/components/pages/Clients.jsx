import React, { useState, useEffect } from "react";
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
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

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
          {clients.map((client) => (
            <ClientCard
              key={client.Id}
              client={client}
              onEdit={openEditModal}
              onDelete={handleDeleteClient}
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