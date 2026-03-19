import { createContext, useContext, useState } from "react";
import { EVENTS } from "../data/mockData";

const EventsContext = createContext(null);

export function EventsProvider({ children }) {
  const [events, setEvents] = useState(EVENTS);

  const addEvent = (newEvent) => {
    const event = {
      ...newEvent,
      id:        Date.now(),
      status:    "upcoming",
      resources: [],
    };
    setEvents((prev) => [event, ...prev]);
    return event;
  };

  return (
    <EventsContext.Provider value={{ events, addEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  return useContext(EventsContext);
}