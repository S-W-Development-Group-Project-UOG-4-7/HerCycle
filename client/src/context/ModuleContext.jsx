import { createContext, useContext, useState } from 'react';
import {
  getModules as getModulesService,
  getModuleById as getModuleByIdService,
  startModule as startModuleService,
  completeModule as completeModuleService,
  getUserProgress as getUserProgressService,
} from '../services/moduleService';

const ModuleContext = createContext();

export const useModules = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModules must be used within a ModuleProvider');
  }
  return context;
};

export const ModuleProvider = ({ children }) => {
  const [modules, setModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchModules = async (category) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getModulesService(category);
      if (response.success) {
        setModules(response.data.modules);
      }
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || { message: 'Failed to fetch modules' });
      setLoading(false);
      return { success: false, error: err.response?.data?.error };
    }
  };

  const fetchModuleById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getModuleByIdService(id);
      if (response.success) {
        setCurrentModule(response.data.module);
      }
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || { message: 'Failed to fetch module' });
      setLoading(false);
      return { success: false, error: err.response?.data?.error };
    }
  };

  const startModule = async (id) => {
    try {
      const response = await startModuleService(id);
      if (response.success) {
        await fetchModuleById(id);
      }
      return response;
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    }
  };

  const completeModule = async (id) => {
    try {
      const response = await completeModuleService(id);
      if (response.success) {
        await fetchModuleById(id);
        await fetchModules();
      }
      return response;
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await getUserProgressService();
      if (response.success) {
        setUserProgress(response.data.moduleProgress);
      }
      return response;
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    }
  };

  const value = {
    modules,
    currentModule,
    userProgress,
    loading,
    error,
    fetchModules,
    fetchModuleById,
    startModule,
    completeModule,
    fetchUserProgress,
  };

  return <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>;
};
