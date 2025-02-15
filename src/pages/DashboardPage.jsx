import React from "react";

import MainLayout from "../layout/MainLayout";
import { RSI } from "../components/RSI";

export const DashboardPage = () => {
  return (
    <MainLayout>
      <RSI />
    </MainLayout>
  );
};
