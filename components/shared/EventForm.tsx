"use client";
import React from "react";

type EventFormProps = {
  userId: string;
  type: "Create" | "Update";
};

const EventForm = ({ userId, type }: EventFormProps) => {
  return <div>EventForm{type}</div>;
};

export default EventForm;
