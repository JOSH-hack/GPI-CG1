import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { agentApi } from '../api/agentApi';

const AgentContext = createContext();

export const AgentProvider = ({ children }) => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);

    const refreshAgents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await agentApi.listerTous();
            setAgents(res.data);
        } catch (error) {
            console.error("Erreur lors du chargement des agents", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshAgents();
    }, [refreshAgents]);

    return (
        <AgentContext.Provider value={{ agents, refreshAgents, loading }}>
            {children}
        </AgentContext.Provider>
    );
};

export const useAgents = () => useContext(AgentContext);
