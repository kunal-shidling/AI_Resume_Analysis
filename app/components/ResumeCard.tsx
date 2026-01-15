import { Link } from "react-router"
import { useState, useEffect } from "react"
import { usePuterStore } from "~/lib/putter"
import ScoreCircle from "./ScoreCircle"

// Image cache to prevent reloading
const imageCache = new Map<string, string>();

const ResumeCard = ({
  resume: {id, companyName, jobTitle, feedback, imagePath},
  onDelete,
  isDeleting = false
}: {
  resume: Resume;
  onDelete: (id: string, e: React.MouseEvent) => void;
  isDeleting?: boolean;
}) => {
  const {fs} = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() =>{
    const loadResume = async () => {
      if (!imagePath) {
        setImageError(true);
        setIsLoading(false);
        return;
      }
      
      // Check cache first
      if (imageCache.has(imagePath)) {
        setResumeUrl(imageCache.get(imagePath)!);
        setIsLoading(false);
        return;
      }
      
      try {
        const blob = await fs.read(imagePath);
        
        if(!blob) {
          setImageError(true);
          setIsLoading(false);
          return;
        }
        
        const url = URL.createObjectURL(blob);
        setResumeUrl(url);
        imageCache.set(imagePath, url); // Cache the URL
        setImageError(false);
      } catch (error) {
        console.error('Error loading image:', error);
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadResume();
  },[imagePath, fs] );
  
  const atsScore = feedback?.ATS?.score || feedback?.overallScore || 0;
  
  return (
    <div className="resume-card animate-in fade-in duration-1000 relative">
      {/* Delete Button */}
      <button
        onClick={(e) => onDelete(id, e)}
        disabled={isDeleting}
        className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete resume"
      >
        {isDeleting ? (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>

      <Link to={`/resume/${id}`} className="block">
        <div className="resume-card-header">
          <div className="flex flex-col gap-2">
            {companyName && <h2 className=" !text-black font-bold break-words">{companyName}</h2>}
            {jobTitle && <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>}
            {!companyName && !jobTitle && <h2 className="!text-black font-bold">Resume</h2>}
          </div>

          <div className="flex-shrink-0">
            <ScoreCircle score={feedback?.overallScore || 0} />
          </div>
        </div>
      
      {/* ATS Score Badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-gray-600">ATS Score:</span>
        <span className={`text-lg font-bold ${atsScore >= 70 ? 'text-green-600' : atsScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
          {atsScore}/100
        </span>
      </div>

      {/* Resume Image or Placeholder */}
      <div className="gradient-boarder">
        <div className="w-full h-full">
          {isLoading ? (
            <div className="w-full h-[350px] max-sm:h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="animate-spin h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : resumeUrl && !imageError ? (
            <img 
              src={resumeUrl}
              alt="resume preview"
              className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-[350px] max-sm:h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-500">Resume Preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </Link>
    </div>
  )
}

export default ResumeCard