import React from "react";
import { Routes, Route } from "react-router";

import { DashboardPage } from "../pages/DashboardPage";

export const Router = () => {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
    </Routes>
  );
};
