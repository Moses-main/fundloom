// src/pages/DocsProtocol.tsx
import React from "react";

const DocsProtocol: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6">FundLoom Protocol Documentation</h1>
      <p className="text-muted-foreground mb-6">
        This page summarizes the planned protocol scaffold and endpoints for upcoming on/off-chain features.
      </p>

      <div className="space-y-4">
        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold">Base</h2>
          <ul className="list-disc pl-6 text-sm mt-2">
            <li>API Base: /api/v1</li>
          </ul>
        </div>

        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold">Rounds & Matching</h2>
          <ul className="list-disc pl-6 text-sm mt-2">
            <li>GET /rounds — list rounds</li>
            <li>POST /rounds — create round</li>
            <li>GET /rounds/:id — round details</li>
            <li>PUT /rounds/:id — update round</li>
            <li>DELETE /rounds/:id — delete round</li>
            <li>POST /rounds/:id/matching/submit — submit off-chain snapshot/proofs</li>
            <li>POST /rounds/:id/matching/finalize — finalize and verify on-chain</li>
          </ul>
        </div>

        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold">Project Registry</h2>
          <ul className="list-disc pl-6 text-sm mt-2">
            <li>GET /registry/projects — list projects</li>
            <li>POST /registry/projects — register project</li>
            <li>GET /registry/projects/:id — project details</li>
            <li>PUT /registry/projects/:id — update metadata reference (e.g., IPFS CID)</li>
          </ul>
        </div>

        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold">Sybil Resistance Verifiers</h2>
          <ul className="list-disc pl-6 text-sm mt-2">
            <li>GET /verifiers — list available verifiers</li>
            <li>POST /verifiers/:provider/verify — submit verification proof</li>
            <li>POST /verifiers/:provider/link — link a verification to the authenticated user</li>
          </ul>
        </div>

        <div className="p-4 rounded-lg border">
          <h2 className="text-xl font-semibold">Notes</h2>
          <ul className="list-disc pl-6 text-sm mt-2">
            <li>Add auth, validation (Joi), and controllers during implementation.</li>
            <li>
              Off-chain QF computations should publish proofs (IPFS/Arweave) referenced by
              /matching/submit.
            </li>
            <li>On-chain verification/disbursement is triggered via /matching/finalize.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DocsProtocol;
