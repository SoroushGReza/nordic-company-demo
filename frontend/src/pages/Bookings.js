import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Alert } from "react-bootstrap";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { axiosReq } from "../api/axiosDefaults";
import "../styles/Bookings.module.css";

const locales = {
    "en-IE": require("date-fns/locale/en-IE"),
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const Bookings = () => {
    const [availableTimes, setAvailableTimes] = useState([]);
    const [bookedTimes, setBookedTimes] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);

    useEffect(() => {
        const fetchTimes = async () => {
            try {
                const { data: availability } = await axiosReq.get("/availability/");
                const { data: bookings } = await axiosReq.get("/bookings/mine/");
                const { data: servicesData } = await axiosReq.get("/services/");

                setAvailableTimes(availability);
                setBookedTimes(bookings);
                setServices(servicesData);
            } catch (err) {
                console.error("Error fetching times:", err);
            }
        };
        fetchTimes();
    }, []);

    const handleServiceChange = (serviceId) => {
        if (selectedServices.includes(serviceId)) {
            setSelectedServices(selectedServices.filter((id) => id !== serviceId));
        } else {
            setSelectedServices([...selectedServices, serviceId]);
        }
    };

    useEffect(() => {
        console.log("Selected Services: ", selectedServices);
        console.log("Selected Time: ", selectedTime);
    }, [selectedServices, selectedTime]);

    const handleBookingSubmit = async () => {
        if (!selectedTime || !selectedServices.length) {
            alert("Please select a service and a time before booking.");
            return;
        }

        try {
            const bookingData = {
                service_ids: selectedServices,
                date_time: selectedTime.toISOString(),
            };

            const response = await axiosReq.post("/bookings/", bookingData);

            if (response.status === 201) {
                setBookingSuccess(true);
            } else {
                console.error("Booking Failed.");
            }
        } catch (error) {
            console.error("Error creating booking:", error.response ? error.response.data : error.message);
        }
    };

    // Funktion f�r att st�lla in f�rger p� h�ndelser i kalendern
    const eventPropGetter = (event) => {
        let backgroundColor = "lightgray"; // Standard f�r otillg�nglig tid

        if (event.available && !event.booked) {
            backgroundColor = "green"; // Tillg�nglig tid
        } else if (event.booked) {
            backgroundColor = "red"; // Bokad tid visas som r�d
        }

        return {
            style: {
                backgroundColor,
                color: "white",
                borderRadius: "0px",
                opacity: 0.8,
                border: "none",
                cursor: event.available ? "pointer" : "default",
            },
        };
    };


    // F�rbered tillg�ngliga tider som h�ndelser
    const availableEvents = availableTimes.flatMap((availability) => {
        const start = new Date(availability.date + 'T' + availability.start_time);
        const end = new Date(availability.date + 'T' + availability.end_time);

        const events = [];
        let current = start;

        // G� igenom varje 30-minuters intervall och skapa separata event
        while (current < end) {
            const next = new Date(current.getTime() + 30 * 60 * 1000); // 30 minuter fram�t
            events.push({
                start: new Date(current),
                end: next,
                title: "Available",
                available: true,
                booked: false,
            });
            current = next;
        }

        return events;
    });


    // F�rbered bokade tider som h�ndelser
    const bookedEvents = bookedTimes.map((booking) => {
        const totalWorktimeInMinutes = booking.services.reduce((acc, service) => {
            console.log(`Service: ${service.name}, Worktime: ${service.worktime}`);

            // Konvertera arbetstiden fr�n sekunder till minuter
            const worktimeInMinutes = service.worktime / 60;
            return acc + worktimeInMinutes;
        }, 0);

        // Ber�kna sluttiden baserat p� 30-minutersintervaller
        const totalWorktimeIn30MinuteBlocks = Math.ceil(totalWorktimeInMinutes / 30);

        return {
            start: new Date(booking.date_time),
            end: new Date(new Date(booking.date_time).getTime() + totalWorktimeIn30MinuteBlocks * 30 * 60 * 1000),
            title: "Booked",
            available: false,
            booked: true,
        };
    });

    const allEvents = [...availableEvents, ...bookedEvents]; // Kombinera alla h�ndelser

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={8}>
                    <h2>Choose Services</h2>
                    {bookingSuccess && <Alert variant="success">Booking Successful!</Alert>}

                    <Form>
                        {services.map((service) => {
                            console.log(`Rendering service: ${service.name} (ID: ${service.id})`);
                            return (
                                <Form.Check
                                    type="checkbox"
                                    key={service.id}
                                    label={`${service.name} (${service.worktime}h)`}
                                    checked={selectedServices.includes(service.id)}
                                    onChange={() => handleServiceChange(service.id)}
                                />
                            );
                        })}
                    </Form>

                    <Button
                        onClick={handleBookingSubmit}
                        disabled={!selectedServices.length || !selectedTime}
                        className="mt-3"
                    >
                        Book Services
                    </Button>

                    <h2 className="mt-4">Choose Date / Time</h2>

                    <Calendar
                        localizer={localizer}
                        events={allEvents}  // Anv�nd kombinerade h�ndelser
                        step={30}
                        timeslots={2}
                        defaultView="week"
                        views={["week"]}
                        min={new Date(2024, 9, 6, 8, 0)}
                        max={new Date(2024, 9, 6, 20, 30)}
                        style={{ height: 600 }}
                        selectable={true}
                        eventPropGetter={eventPropGetter}  // St�ll in f�rger och cursor f�r h�ndelser
                        onSelectSlot={(slotInfo) => {
                            console.log("Slot clicked! Info: ", slotInfo);

                            // Anv�nd den exakta tidpunkten som anv�ndaren klickar p�
                            setSelectedTime(slotInfo.start);
                            console.log("Selected Time:", slotInfo.start);
                        }}
                        onSelectEvent={(event) => {
                            if (event.available) {
                                // Om en tillg�nglig tid klickas, v�lj den exakta tidpunkten.
                                setSelectedTime(event.start);
                                console.log("Selected Time from Event:", event.start);
                            } else {
                                alert("This time is already booked!");
                            }
                        }}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default Bookings;

