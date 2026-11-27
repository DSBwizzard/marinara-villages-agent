import { createContext, useContext } from "react";

export const AgendaWaiting = createContext(false);
export const useAgendaWaiting = () => useContext(AgendaWaiting);
