const axios = require('axios');
require('dotenv').config();

const pterodactylAPI = axios.create({
  baseURL: process.env.PTERODACTYL_URL,
  headers: {
    'Authorization': `Bearer ${process.env.PTERODACTYL_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Get all servers
const getServers = async () => {
  try {
    const response = await pterodactylAPI.get('/api/application/servers');
    return response.data.data;
  } catch (error) {
    console.error('Error getting servers:', error);
    return null;
  }
};

// Get server details
const getServerDetails = async (serverId) => {
  try {
    const response = await pterodactylAPI.get(`/api/application/servers/${serverId}`);
    return response.data.attributes;
  } catch (error) {
    console.error('Error getting server details:', error);
    return null;
  }
};

// Create new account on server
const createAccountOnServer = async (serverId, accountData) => {
  try {
    const response = await pterodactylAPI.post(`/api/application/servers/${serverId}/databases`, {
      host: accountData.dbHostId,
      database: accountData.dbName,
      username: accountData.dbUser,
      password: accountData.dbPassword,
      max_connections: 100
    });
    return response.data;
  } catch (error) {
    console.error('Error creating account:', error);
    return null;
  }
};

// Restock account
const restockAccount = async (serverId, username, quantity) => {
  try {
    const response = await pterodactylAPI.post(`/api/application/servers/${serverId}/files/write`, {
      file: `/restock/${username}.json`,
      content: JSON.stringify({
        username: username,
        quantity: quantity,
        timestamp: new Date().toISOString()
      })
    });
    return response.data;
  } catch (error) {
    console.error('Error restocking account:', error);
    return null;
  }
};

module.exports = { getServers, getServerDetails, createAccountOnServer, restockAccount };
