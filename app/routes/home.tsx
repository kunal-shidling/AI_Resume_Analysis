import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/putter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { resume } from "react-dom/server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream" },
  ];
}

export default function Home() {
  const { auth, kv, puterReady} = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/auth?next=/");
    }
  }, [auth.isAuthenticated, navigate]);


  useEffect(() => {
    if (!puterReady) return;
    if (hasLoadedOnce && refreshKey === 0) return; // Skip reload if already loaded
    
    const loadResumes = async () => {
      setLoadingResumes(true);

      try {
        const keys = await kv.list('resume:*');
        console.log(`Found ${keys?.length || 0} resume keys`);
        
        if (!keys || keys.length === 0) {
          setResumes([]);
          setLoadingResumes(false);
          setHasLoadedOnce(true);
          return;
        }

        // Parallel fetching for faster load
        const fetchPromises = keys.map(async (key) => {
          try {
            const value = await kv.get(key);
            if (!value || value === "undefined" || value === "deleted") return null;
            const resumeData = JSON.parse(value);
            return resumeData?.id ? resumeData : null;
          } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return null;
          }
        });

        const results = await Promise.all(fetchPromises);
        const parsedResumes = results.filter((r): r is Resume => r !== null);

        console.log(`✅ Loaded ${parsedResumes.length} resumes`);
        setResumes(parsedResumes);
        setHasLoadedOnce(true);
      } catch (error) {
        console.error("Error loading resumes:", error);
        setResumes([]);
      } finally {
        setLoadingResumes(false);
      }
    }
    loadResumes()
  },[puterReady, kv, refreshKey, hasLoadedOnce]);

  // Delete resume function
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }
    
    setDeletingId(id);
    try {
      // Puter KV doesn't have delete, so we set to null or use set with empty value
      await kv.set(`resume:${id}`, 'deleted');
      setResumes(prev => prev.filter(r => r.id !== id));
      console.log(`Deleted resume: ${id}`);
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };
  

  return <main className="responsive-bg bg-cover">
    <Navbar/>
    {/* {window.puter.ai.chat()} */}
    <section className="main-section">
      <div className="page-heading py-8 md:py-16">
        <h1>Track your Applications & Resume Ratings</h1>
        {!loadingResumes && resumes?.length ===0 ?(
          <h2>No resumes found. Upload your first resume to get feedback.</h2>
        ):(
          <div className="flex flex-col items-center gap-3">
            <h2>Review your {resumes.length} submission{resumes.length !== 1 ? 's' : ''} and check AI-powered feedback.</h2>
            <button 
              onClick={() => setRefreshKey(prev => prev + 1)} 
              className="text-sm text-gray-600 hover:text-gray-900 underline flex items-center gap-1"
              disabled={loadingResumes}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        )}
      </div>
      {loadingResumes && (
        <div className="flex flex-col items-center justify-center">
          <img src="/images/resume-scan-2.gif" className="w-[200px]" alt="" />
        </div>
      )}

    

    {!loadingResumes && resumes.length > 0 &&(
    <div className="resumes-section">

    {resumes.map((resume) => (
      <ResumeCard 
        key={resume.id} 
        resume={resume} 
        onDelete={handleDelete}
        isDeleting={deletingId === resume.id}
      />
    ))}
    </div>
    )}

    {!loadingResumes && resumes?.length === 0 &&(
      <div className="flex flex-col items-center justify-center mt-10 gap-4">
        <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
        Upload Resume
        </Link>
      </div>
    )}
    </section>
  </main>
}
