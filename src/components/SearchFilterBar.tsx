// src/components/SearchFilterBar.tsx
import React from "react";
import { Search, Filter, Plus } from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface Props {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  categories: string[];
  categoryFilter: string;
  setCategoryFilter: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  statuses: string[];
}

const SearchFilterBar: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  categories,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  statuses,
}) => {
  const { setShowCreateModal } = useAppContext();
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0 w-full">
      <div className="relative flex-1 md:max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search campaigns..."
          className="w-full pl-10 pr-4 py-3 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center flex-wrap gap-3">
        <div className="flex items-center border border-border rounded-lg px-3 py-2">
          <Filter className="h-4 w-4 mr-2" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm bg-transparent outline-none text-foreground"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center border border-border rounded-lg px-3 py-2">
          <Filter className="h-4 w-4 mr-2" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-transparent outline-none text-foreground"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex w-full md:w-auto items-center justify-center space-x-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Create Campaign</span>
        </button>
      </div>
    </div>
  );
};

export default SearchFilterBar;
