import { createContext, useContext, useState, useEffect } from "react";

const EventsContext = createContext();

export function EventsProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchEvents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`);
        const data = await response.json();

        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load events:", error);
        setLoading(false);
      }
    };

    fetchEvents();
    
  }, []);

  const addEvent = async (eventData) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(eventData),
    });

    const data = await response.json();

    if (response.ok) {
      setEvents((prevEvents) => [...prevEvents, data]);
      return { success: true };
    } else {
      return { success: false, error: data.message };
    }
  };

  const updateEvent = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((e) => (String(e.id) === String(updatedEvent.id) ? updatedEvent : e))
    );
  };

  return (
    <EventsContext.Provider value={{ events, loading, addEvent, updateEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  return useContext(EventsContext);
}