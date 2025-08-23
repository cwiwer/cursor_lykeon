import React, { createContext, useContext, useEffect, useState } from "react";
import { getMyChildren, getActiveChild, setActiveChildId, type ChildProfile } from "../services/students";

type Ctx = {
  children: ChildProfile[];
  activeChild: ChildProfile | null;
  setActiveChild: (c: ChildProfile) => void;
  loading: boolean;
  refreshChildren: () => Promise<void>;
  refresh: () => Promise<void>;
  handleChildRemoved: (removedChildId: string) => Promise<void>;
};

const StudentContext = createContext<Ctx>({ 
  children: [], 
  activeChild: null, 
  setActiveChild: () => {}, 
  loading: true,
  refreshChildren: async () => {},
  refresh: async () => {},
  handleChildRemoved: async () => {}
});

export const useStudent = () => useContext(StudentContext);

export function StudentProvider({ children: ui }: { children: React.ReactNode }) {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [activeChild, setActive] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadChildren = async () => {
    try {
      console.log('StudentContext: Carregando crianças...');
      const list = await getMyChildren();
      console.log('StudentContext: Crianças carregadas:', list);
      setChildren(list);
      
      const saved = await getActiveChild();
      console.log('StudentContext: Aluno salvo encontrado:', saved);
      
      if (saved && list.find(c => c.id === saved.id)) {
        console.log('StudentContext: Definindo aluno salvo como ativo');
        setActive(saved);
      } else if (list.length > 0) {
        console.log('StudentContext: Definindo primeira criança como ativa');
        setActive(list[0]);
        setActiveChildId(list[0].id);
      } else {
        console.log('StudentContext: Nenhuma criança encontrada');
        setActive(null);
      }
    } catch (error) {
      console.error("Erro ao carregar crianças:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  function setActiveChild(c: ChildProfile) {
    console.log('StudentContext: Definindo aluno ativo:', c);
    setActive(c);
    setActiveChildId(c.id);
    console.log('StudentContext: Aluno ativo definido e salvo no localStorage');
  }

  const refreshChildren = async () => {
    await loadChildren();
  };

  const refresh = async () => {
    await loadChildren();
  };

  // Método para lidar com mudanças após unlink/delete
  const handleChildRemoved = async (removedChildId: string) => {
    // Se a criança removida era a ativa, selecionar outra ou redirecionar
    if (activeChild?.id === removedChildId) {
      const remainingChildren = children.filter(c => c.id !== removedChildId);
      if (remainingChildren.length > 0) {
        setActiveChild(remainingChildren[0]);
        setActiveChildId(remainingChildren[0].id);
      } else {
        setActive(null);
        setActiveChildId('');
      }
    }
    
    // Recarregar lista
    await loadChildren();
  };

  return (
    <StudentContext.Provider value={{ children, activeChild, setActiveChild, loading, refreshChildren, refresh, handleChildRemoved }}>
      {ui}
    </StudentContext.Provider>
  );
}