import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  useCreateDestinationMutation,
  useDeleteDestinationMutation,
  useDestinationsQuery,
  useSearchDestinationsQuery,
  useUpdateDestinationMutation,
} from "../api/hooks/destinationHooks";
import { DestinationSidebar } from "../components/tour-destination/DestinationSidebar";
import { DestinationStats } from "../components/tour-destination/DestinationStats";
import { DestinationTable } from "../components/tour-destination/DestinationTable";
import { toast } from "../utils/toast";

const pageSize = 10;
const SEARCH_DEBOUNCE_MS = 500;

export const TourDestinationPage = () => {
  const { data: destinations = [], isLoading } = useDestinationsQuery();
  
  const [selectedId, setSelectedId] = useState(null);
  const [cityName, setCityName] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("Việt Nam");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshingSearch, setIsRefreshingSearch] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Use backend search when debouncedSearchTerm is provided, otherwise use empty string for getAll
  const { data: searchResults = null, isLoading: isSearchLoading } = useSearchDestinationsQuery(
    debouncedSearchTerm,
    currentPage - 1,
    debouncedSearchTerm !== ""
  );

  useEffect(() => {
    if (!imagePreviewUrl || !imagePreviewUrl.startsWith("blob:")) {
      return undefined;
    }

    return () => URL.revokeObjectURL(imagePreviewUrl);
  }, [imagePreviewUrl]);

  const uniqueRegions = useMemo(
    () => Array.from(new Set(destinations.map((destination) => destination.region).filter(Boolean))),
    [destinations],
  );

  // Use search results if available, otherwise use local filtering
  const filteredDestinations = useMemo(() => {
    if (debouncedSearchTerm !== "") {
      // When searching, use backend search results and apply region filter locally
      const searchContent = searchResults?.content ?? [];
      if (regionFilter === "ALL") {
        return searchContent;
      }
      return searchContent.filter((destination) => destination.region === regionFilter);
    }

    // No search term: use all destinations with region filter
    return destinations.filter((destination) => {
      const matchRegion = regionFilter === "ALL" || destination.region === regionFilter;
      return matchRegion;
    });
  }, [destinations, searchResults, debouncedSearchTerm, regionFilter]);

  // Determine pagination based on whether we're searching
  const totalPages = useMemo(() => {
    if (debouncedSearchTerm !== "") {
      return searchResults?.totalPages ?? 1;
    }
    return Math.max(1, Math.ceil(filteredDestinations.length / pageSize));
  }, [searchResults, debouncedSearchTerm, filteredDestinations]);

  const safePage = Math.min(currentPage, totalPages);

  const paginatedDestinations = useMemo(() => {
    if (debouncedSearchTerm !== "") {
      // Backend search already handles pagination
      return filteredDestinations;
    }
    // Local pagination
    return filteredDestinations.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filteredDestinations, debouncedSearchTerm, safePage]);

  const totalDestinations = destinations.length;
  const totalCities = new Set(destinations.map((destination) => destination.region).filter(Boolean)).size;
  const totalCountries = new Set(destinations.map((destination) => destination.country).filter(Boolean)).size;

  const selectedDestination = destinations.find((destination) => destination.id === selectedId) || null;

  const createMutation = useCreateDestinationMutation({
    onSuccess: () => {
      setCityName("");
      setRegion("");
      setCountry("Việt Nam");
      setImageUrl("");
      setImageFile(null);
      setImagePreviewUrl("");
      setSelectedId(null);
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setCurrentPage(1);
    },
  });

  const updateMutation = useUpdateDestinationMutation({
    onSuccess: (_, variables) => {
      setImageFile(null);
      if (variables?.imageUrl) {
        setImageUrl(variables.imageUrl);
        setImagePreviewUrl(variables.imageUrl);
      }
    },
  });

  const deleteMutation = useDeleteDestinationMutation({
    onSuccess: (_, deletingId) => {
      if (selectedId === deletingId) {
        setSelectedId(null);
        setCityName("");
        setRegion("");
        setCountry("Việt Nam");
        setImageUrl("");
        setImageFile(null);
        setImagePreviewUrl("");
      }
    },
  });

  const syncFormToDestination = (destination) => {
    setSelectedId(destination.id);
    setCityName(destination.cityName || "");
    setRegion(destination.region || "");
    setCountry(destination.country || "Việt Nam");
    setImageUrl(destination.imageUrl || destination.image_url || "");
    setImageFile(null);
    setImagePreviewUrl(destination.imageUrl || destination.image_url || "");
  };

  const handleStartCreate = () => {
    setSelectedId(null);
    setCityName("");
    setRegion("");
    setCountry("Việt Nam");
    setImageUrl("");
    setImageFile(null);
    setImagePreviewUrl("");
  };

  const handleSelectImageFile = (file) => {
    if (!file) return;
    setImageFile(file);
    setImageUrl("");
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImageUrl("");
    setImagePreviewUrl("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextCityName = cityName.trim();
    const nextCountry = country.trim();
    if (!nextCityName || !nextCountry) return;

    try {
      const payload = {
        cityName: nextCityName,
        region: region.trim(),
        country: nextCountry,
        imageUrl: imageUrl.trim(),
        file: imageFile,
      };

      if (selectedId) {
        await updateMutation.mutateAsync({ id: selectedId, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Lưu điểm đến thất bại";
      toast.error(errorMessage);
    }
  };

  const handleReset = () => {
    if (selectedDestination) {
      syncFormToDestination(selectedDestination);
      return;
    }
    handleStartCreate();
  };

  const handleResetSearch = () => {
    setIsRefreshingSearch(true);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setRegionFilter("ALL");
    setCurrentPage(1);
    window.setTimeout(() => setIsRefreshingSearch(false), 450);
  };

  const handleDelete = (destination) => {
    if (!window.confirm(`Xóa điểm đến "${destination.cityName}"?`)) return;
    deleteMutation.mutate(destination.id);
  };

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
  };

  return (
    <div className="space-y-5 text-slate-700">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-white px-6 py-6">
          <h2 className="text-3xl uppercase font-black tracking-tight text-blue-600 md:text-[42px]">
            Quản lý Tour / Điểm đến
          </h2>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                Cập nhật và điều chỉnh các địa danh trong hệ thống tour.
              </p>
            </div>
          </div>
        </div>

        <DestinationStats
          totalDestinations={totalDestinations}
          totalCities={totalCities}
          totalCountries={totalCountries}
        />

        <div className="grid gap-5 px-6 pb-6 xl:grid-cols-[minmax(0,1.4fr)_420px]">
          <DestinationTable
            searchTerm={searchTerm}
            onSearchTermChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            onResetSearch={handleResetSearch}
            isRefreshingSearch={isRefreshingSearch}
            regionFilter={regionFilter}
            onRegionFilterChange={(value) => {
              setRegionFilter(value);
              setCurrentPage(1);
            }}
            uniqueRegions={uniqueRegions}
            paginatedDestinations={paginatedDestinations}
            filteredDestinations={filteredDestinations}
            isLoading={isLoading || isSearchLoading}
            pageSize={pageSize}
            selectedId={selectedId}
            onSelectDestination={syncFormToDestination}
            onDelete={handleDelete}
            deletePending={deleteMutation.isPending}
            totalPages={totalPages}
            safePage={safePage}
            onGoToPage={goToPage}
          />

          <DestinationSidebar
            cityName={cityName}
            region={region}
            country={country}
            imagePreviewUrl={imagePreviewUrl}
            onCityNameChange={setCityName}
            onRegionChange={setRegion}
            onCountryChange={setCountry}
            onSelectImageFile={handleSelectImageFile}
            onClearImage={handleClearImage}
            onStartCreate={handleStartCreate}
            onSubmit={handleSubmit}
            isSaving={createMutation.isPending || updateMutation.isPending}
            isEditing={Boolean(selectedDestination)}
            editingDestinationName={selectedDestination?.cityName ?? ""}
            submitLabel={selectedDestination ? "Cập nhật" : "Lưu điểm đến"}
          />
        </div>
      </section>
    </div>
  );
};