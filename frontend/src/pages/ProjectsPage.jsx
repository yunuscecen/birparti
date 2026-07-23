import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Container from "../components/common/Container";
import ProjectCard from "../components/projects/ProjectCard";
import {
  getProjectCategories,
  getProjects,
} from "../services/projectService";
import CrowdSilhouette from "../components/visual/CrowdSilhouette";

const ProjectsPage = () => {
  const [selectedCategory, setSelectedCategory] =
    useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  useEffect(() => {
    document.title = "Projelerimiz | Bir Parti";

    return () => {
      document.title = "Bir Parti";
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  const categoriesQuery = useQuery({
    queryKey: ["project-categories"],
    queryFn: getProjectCategories,
  });

  const projectsQuery = useQuery({
    queryKey: [
      "projects",
      selectedCategory,
      debouncedSearch,
    ],
    queryFn: () =>
      getProjects({
        category: selectedCategory,
        search: debouncedSearch,
      }),
  });

  const categories =
    categoriesQuery.data?.data || [];

  const projects =
    projectsQuery.data?.data || [];

  const isLoading =
    categoriesQuery.isLoading ||
    projectsQuery.isLoading;

  const hasError =
    categoriesQuery.isError ||
    projectsQuery.isError;

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchInput("");
    setDebouncedSearch("");
  };

  return (
    <div className="projects-page">
      <section className="projects-hero">
        <div
          className="projects-hero__watermark"
          aria-hidden="true"
        >
          ,
        </div>

        <Container className="projects-hero__container">
          <p className="projects-hero__eyebrow">
            Geleceği birlikte kuralım
          </p>

          <h1>Projelerimiz</h1>

          <p className="projects-hero__description">
            Bu projeler hayal değil. Bu projeler radikal
            değil. Bu projeler gecikmiş adalettir.
          </p>
        </Container>
      </section>

      <section className="projects-content">
        <Container>
          <div className="projects-toolbar">
            <div className="projects-search">
              <Search
                size={20}
                aria-hidden="true"
              />

              <input
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Projelerde ara..."
                aria-label="Projelerde ara"
              />
            </div>

            <div className="projects-toolbar__label">
              <SlidersHorizontal size={18} />
              Kategoriler
            </div>
          </div>

          <div
            className="project-filters"
            aria-label="Proje kategorileri"
          >
            <button
              type="button"
              className={`project-filter ${
                selectedCategory === ""
                  ? "project-filter--active"
                  : ""
              }`}
              onClick={() =>
                setSelectedCategory("")
              }
            >
              Tümü
            </button>

            {categories.map((category) => (
              <button
                type="button"
                key={category._id}
                className={`project-filter ${
                  selectedCategory ===
                  category.slug
                    ? "project-filter--active"
                    : ""
                }`}
                style={{
                  "--filter-color": category.color,
                }}
                onClick={() =>
                  setSelectedCategory(
                    category.slug
                  )
                }
              >
                {category.name}
              </button>
            ))}
          </div>

          {isLoading && (
            <div
              className="projects-loading"
              aria-live="polite"
            >
              <span className="projects-loading__spinner" />
              <p>Projeler yükleniyor...</p>
            </div>
          )}

          {!isLoading && hasError && (
            <div className="projects-message">
              <h2>Projeler yüklenemedi.</h2>

              <p>
                Backend bağlantısını ve MongoDB
                verilerini kontrol et.
              </p>

              <button
                type="button"
                onClick={() => {
                  categoriesQuery.refetch();
                  projectsQuery.refetch();
                }}
              >
                Tekrar Dene
              </button>
            </div>
          )}

          {!isLoading &&
            !hasError &&
            projects.length === 0 && (
              <div className="projects-message">
                <h2>Proje bulunamadı.</h2>

                <p>
                  Arama kriterine uygun yayınlanmış
                  bir proje bulunmuyor.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}

          {!isLoading &&
            !hasError &&
            projects.length > 0 && (
              <>
                <div className="projects-result-count">
                  <strong>{projects.length}</strong>{" "}
                  proje gösteriliyor.
                </div>

                <div className="projects-grid">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project._id}
                      project={project}
                    />
                  ))}
                </div>
              </>
            )}
        </Container>
        <CrowdSilhouette />
      </section>
    </div>
  );
};

export default ProjectsPage;