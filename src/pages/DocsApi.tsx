// src/pages/DocsApi.tsx
import React from "react";

const DocsApi: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6">FundLoom API Documentation</h1>
      <p className="text-muted-foreground mb-6">
        This page summarizes the backend REST API endpoints exposed by the server.
        Use the interactive Swagger docs while developing locally.
      </p>

      <div className="space-y-4">
        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold">Base URLs</h2>
          <ul className="list-disc pl-6 text-sm mt-2">
            <li>Base: http://localhost:5000</li>
            <li>API Base: http://localhost:5000/api/v1</li>
            <li>Swagger: http://localhost:5000/api/v1/docs</li>
          </ul>
        </div>

        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold">Auth</h2>
          <ul className="list-disc pl-6 text-sm mt-2">
            <li>POST /auth/register</li>
            <li>POST /auth/login</li>
            <li>GET /auth/me</li>
            <li>POST /auth/logout</li>
            <li>POST /auth/forgot-password</li>
            <li>POST /auth/reset-password</li>
            <li>POST /auth/connect-wallet</li>
            <li>POST /auth/disconnect-wallet</li>
          </ul>
        </div>

        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold">Campaigns</h2>
          <ul className="list-disc pl-6 text-sm mt-2">
            <li>GET /campaigns</li>
            <li>GET /campaigns/:id</li>
            <li>POST /campaigns</li>
            <li>PUT /campaigns/:id</li>
            <li>DELETE /campaigns/:id</li>
            <li>GET /campaigns/user/:userId</li>
            <li>POST /campaigns/:id/updates</li>
            <li>GET /campaigns/stats/overview</li>
          </ul>
        </div>

        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold">Donations</h2>
          <ul className="list-disc pl-6 text-sm mt-2">
            <li>POST /donations</li>
            <li>POST /donations/guest</li>
            <li>GET /donations/campaign/:campaignId</li>
            <li>GET /donations/my-donations</li>
            <li>GET /donations/:id</li>
            <li>GET /donations/stats/overview</li>
            <li>GET /donations/leaderboard</li>
          </ul>
        </div>

        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold">Comments</h2>
          <ul className="list-disc pl-6 text-sm mt-2">
            <li>GET /comments/campaign/:campaignId</li>
            <li>POST /comments/campaign/:campaignId</li>
            <li>PUT /comments/:id</li>
            <li>DELETE /comments/:id</li>
            <li>POST /comments/:id/like</li>
            <li>POST /comments/:id/report</li>
            <li>GET /comments/my-comments</li>
          </ul>
        </div>

        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold">Users</h2>
          <ul className="list-disc pl-6 text-sm mt-2">
            <li>GET /users/:id</li>
            <li>PUT /users/profile</li>
            <li>POST /users/avatar</li>
            <li>GET /users/dashboard</li>
            <li>GET /users (admin)</li>
            <li>PUT /users/:id/role (admin)</li>
            <li>PUT /users/:id/verify (admin)</li>
            <li>DELETE /users/account</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DocsApi;
