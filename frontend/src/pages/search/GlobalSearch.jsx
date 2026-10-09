import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { globalSearchApi } from "../../services/search.api";

import SearchResultCard from "./SearchResultCard";

import {
  SEARCH_TYPES,
  SEARCH_TYPE_OPTIONS,
} from "./search.constants";
import QuickActions from "./QuickActions";

export default function GlobalSearch() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState(
    SEARCH_TYPES.ALL
  );

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  // ========================================
  // SEARCH
  // ========================================

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setSearched(true);
        setError("");

        const params = {
          q: trimmedQuery,
        };

        if (searchType !== SEARCH_TYPES.ALL) {
          params.type = searchType;
        }

        const response =
          await globalSearchApi(params);

        const data = response?.data || {};

        if (!cancelled) {
          setResults(data.items || data.results || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Global search failed:", error);
          setResults([]);
          setError(
            error?.response?.data?.message ||
              "Search failed. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, searchType]);

  const handleQueryChange = (event) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);

    if (nextQuery.trim().length < 2) {
      setResults([]);
      setSearched(false);
      setError("");
      setLoading(false);
    }
  };

  // ========================================
  // RESULT CLICK
  // ========================================

  const handleResultClick = (result) => {
    if (!result?.id) {
      return;
    }

    switch (result.type) {
      case "lead":
        navigate(`/leads/${result.id}`);
        break;

      case "application":
        navigate(`/applications/${result.id}`);
        break;

      case "loan":
        navigate(`/loans/${result.id}`);
        break;

      default:
        break;
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Global Search
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Search leads, applications and loans
        </p>
      </div>

      {/* ================================== */}
      {/* SEARCH BOX */}
      {/* ================================== */}

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          {/* SEARCH INPUT */}

          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg">
              🔍
            </span>

            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search customer, mobile, application or loan..."
              className="w-full rounded-lg border py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* TYPE */}

          <select
            value={searchType}
            onChange={(event) =>
              setSearchType(event.target.value)
            }
            className="rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            {SEARCH_TYPE_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <p className="mt-2 text-xs text-gray-400">
          Enter at least 2 characters to search.
        </p>
      </div>

      <QuickActions />

      {/* ================================== */}
      {/* RESULTS */}
      {/* ================================== */}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-500">
              Searching...
            </p>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          </div>
        ) : !searched ? (
          <div className="p-12 text-center">
            <div className="text-4xl">🔍</div>

            <h3 className="mt-3 font-semibold text-gray-900">
              Search FinBoat CRM
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Search by customer name, mobile,
              application or loan.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl">📭</div>

            <h3 className="mt-3 font-semibold text-gray-900">
              No results found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try another name, mobile number or ID.
            </p>
          </div>
        ) : (
          <div>
            {results.map((result) => (
              <SearchResultCard
                key={`${result.type}-${result.id}`}
                result={result}
                onClick={handleResultClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}