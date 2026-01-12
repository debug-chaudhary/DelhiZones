import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, MapPin, Briefcase, DollarSign, Clock, Filter, 
  Menu, X, CheckCircle, ChevronRight, Mail, Phone, Building2, Globe 
} from 'lucide-react';

/* --- CUSTOM STYLES FOR ANIMATIONS --- 
   (Injected directly to work without tailwind.config.js modifications) 
*/
const customStyles = `
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleUp {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-left { animation: fadeInLeft 0.5s ease-out forwards; }
  .animate-scale-up { animation: scaleUp 0.3s ease-out forwards; }
  .animate-fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }
`;

/* --- BRAND CONFIGURATION --- */
const BRAND = {
  name: "Delhizones",
  colors: {
    primary: "bg-blue-900",    // Deep Corporate Blue
    accent: "bg-orange-500",   // Action/Highlight Orange
    accentHover: "hover:bg-orange-600",
    light: "bg-blue-50"
  }
};

/* --- SUB-COMPONENTS --- */

// 1. Notification Toast
const Toast = ({ message, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed top-24 right-5 z-50 flex items-center px-6 py-4 rounded-lg shadow-xl bg-green-600 text-white animate-fade-in-left">
      <CheckCircle className="w-5 h-5 mr-3" />
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-6 opacity-80 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
};

// 2. Modal Wrapper
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

/* --- MAIN APPLICATION --- */
export default function DelhiZonesPortal() {
  // State
  const [activeModal, setActiveModal] = useState(null); // 'apply'
  const [notification, setNotification] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters State
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ location: "", category: "", type: "" });

  // Mock Database
  const jobs = useMemo(() => [
    { id: 1, title: "Delivery Partner", company: "Zomato", loc: "South Delhi", cat: "Logistics", salary: "₹25k/mo", type: "Full Time", posted: "2d ago", featured: true },
    { id: 2, title: "Back Office Exec", company: "TechZone Pvt Ltd", loc: "Noida Sec 62", cat: "Admin", salary: "₹18k/mo", type: "Full Time", posted: "1d ago", featured: false },
    { id: 3, title: "Private Maths Tutor", company: "EdTech Home", loc: "West Delhi", cat: "Education", salary: "₹500/hr", type: "Part Time", posted: "4h ago", featured: true },
    { id: 4, title: "Social Media Manager", company: "CreativeBox", loc: "Gurgaon", cat: "Creative", salary: "₹35k/mo", type: "Full Time", posted: "3d ago", featured: true },
    { id: 5, title: "Data Entry Operator", company: "Global Services", loc: "Remote", cat: "Admin", salary: "₹15k/mo", type: "Contract", posted: "5d ago", featured: false },
    { id: 6, title: "Real Estate Sales", company: "DLF Partners", loc: "Noida", cat: "Sales", salary: "₹30k + Inc", type: "Full Time", posted: "1w ago", featured: false },
    { id: 7, title: "Warehouse Packer", company: "Flipkart Hub", loc: "Faridabad", cat: "Logistics", salary: "₹14k/mo", type: "Full Time", posted: "2d ago", featured: false },
    { id: 8, title: "Receptionist", company: "City Hospital", loc: "South Delhi", cat: "Admin", salary: "₹22k/mo", type: "Full Time", posted: "6h ago", featured: false },
  ], []);

  // Filter Logic
  const filteredJobs = jobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) || job.company.toLowerCase().includes(search.toLowerCase());
    const matchLoc = filters.location ? job.loc.includes(filters.location) : true;
    const matchCat = filters.category ? job.cat === filters.category : true;
    const matchType = filters.type ? job.type === filters.type : true;
    return matchSearch && matchLoc && matchCat && matchType;
  });

  // Handlers
  const notify = (msg) => setNotification({ message: msg });
  
  const handleApplySubmit = (e) => {
    e.preventDefault();
    setActiveModal(null);
    notify(`Application sent to ${selectedJob?.company} successfully!`);
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setActiveModal('apply');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <style>{customStyles}</style>
      
      {/* Toast Notification */}
      {notification && <Toast message={notification.message} onClose={() => setNotification(null)} />}

      {/* --- HEADER --- */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setSearch(""); setFilters({location:"", category:"", type:""}); window.scrollTo(0,0)}}>
            <div className={`${BRAND.colors.primary} text-white p-2.5 rounded-lg shadow-lg`}>
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight leading-none">
                DELHI<span className="text-orange-500">ZONES</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">NCR's Job Directory</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-600">
            <a href="#" className="hover:text-blue-900 transition-colors">Browse Jobs</a>
            <a href="#" className="hover:text-blue-900 transition-colors">Companies</a>
            <a href="#" className="hover:text-blue-900 transition-colors">Career Advice</a>
            
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            
            <button className={`${BRAND.colors.primary} hover:bg-blue-800 text-white px-5 py-2.5 rounded-full shadow-md transition-all flex items-center gap-2`}>
              <Briefcase className="w-4 h-4" />
              For Employers
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 space-y-4 shadow-lg animate-fade-in-down">
            <a href="#" className="block py-2 font-medium text-gray-700">Browse Jobs</a>
            <a href="#" className="block py-2 font-medium text-gray-700">Companies</a>
            <hr />
            <button className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold">Post a Job (Free)</button>
          </div>
        )}
      </header>

      {/* --- HERO SECTION --- */}
      <section className={`${BRAND.colors.primary} relative py-16 sm:py-24 overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-800 text-blue-100 text-xs font-bold mb-6 border border-blue-700">
            #1 Job Portal for Delhi NCR
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            Connecting Talent in <br/><span className="text-orange-400">Every Zone of Delhi</span>
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Direct connections. No middleman fees. Find verified jobs in South Delhi, Noida, Gurgaon, and nearby zones.
          </p>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-xl shadow-2xl flex flex-col sm:flex-row gap-2 max-w-4xl mx-auto">
            <div className="flex-1 flex items-center px-4 h-12 bg-gray-50 rounded-lg sm:bg-white border sm:border-none border-gray-200">
              <Search className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by job title, skill, or company..." 
                className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
            <div className="sm:w-1/3 flex items-center px-4 h-12 bg-gray-50 rounded-lg sm:bg-white border sm:border-none sm:border-l border-gray-200">
              <MapPin className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
              <select 
                className="w-full bg-transparent outline-none text-gray-700 cursor-pointer"
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              >
                <option value="">All Zones</option>
                <option value="South Delhi">South Delhi</option>
                <option value="North Delhi">North Delhi</option>
                <option value="West Delhi">West Delhi</option>
                <option value="East Delhi">East Delhi</option>
                <option value="Noida">Noida</option>
                <option value="Gurgaon">Gurgaon</option>
                <option value="Faridabad">Faridabad</option>
                <option value="Remote">Work From Home</option>
              </select>
            </div>
            <button className={`${BRAND.colors.accent} ${BRAND.colors.accentHover} text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-lg`}>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT GRID --- */}
      <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR FILTERS */}
        <aside className="w-full lg:w-72 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><Filter className="w-5 h-5 text-blue-600" /> Filters</h3>
              <button 
                onClick={() => {setSearch(""); setFilters({location:"", category:"", type:""})}} 
                className="text-xs font-semibold text-blue-600 hover:text-orange-500 transition-colors"
              >
                Clear All
              </button>
            </div>
            
            {/* Category */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Job Category</label>
              <select className="w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-100 outline-none" onChange={(e) => setFilters({...filters, category: e.target.value})} value={filters.category}>
                <option value="">All Categories</option>
                <option value="Logistics">Logistics & Delivery</option>
                <option value="Admin">Admin & Back Office</option>
                <option value="Education">Education & Teaching</option>
                <option value="Creative">Creative & Design</option>
                <option value="Sales">Sales & Marketing</option>
              </select>
            </div>

            {/* Job Type */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employment Type</label>
              <div className="space-y-2.5">
                {['Full Time', 'Part Time', 'Contract'].map(type => (
                  <label key={type} className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-blue-900 transition-colors group">
                    <div className={`w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-orange-500 ${filters.type === type ? 'border-orange-500' : ''}`}>
                      {filters.type === type && <div className="w-2 h-2 bg-orange-500 rounded-full"></div>}
                    </div>
                    <input type="radio" name="type" className="hidden" onChange={() => setFilters({...filters, type})} checked={filters.type === type} />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Salary Range (Visual Only) */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Salary Range</label>
               <div className="flex items-center gap-2 text-sm text-gray-500">
                 <span>₹0</span>
                 <input type="range" className="w-full accent-blue-900 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                 <span>₹1L+</span>
               </div>
            </div>
          </div>

          {/* Ad Space */}
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl p-6 text-white text-center shadow-lg">
            <Building2 className="w-10 h-10 mx-auto mb-3 text-orange-400" />
            <h4 className="font-bold text-lg mb-2">Hiring in Bulk?</h4>
            <p className="text-sm text-gray-300 mb-4">Post unlimited jobs for your company and access our candidate database.</p>
            <button className="bg-orange-500 text-white text-sm font-bold py-2.5 px-4 rounded-lg w-full hover:bg-orange-600 transition-colors shadow-md">
              Employer Dashboard
            </button>
          </div>
        </aside>

        {/* JOB LISTINGS */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              {filteredJobs.length} Jobs Found <span className="font-normal text-gray-500 text-base">in Delhi NCR</span>
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
               <span>Sort by:</span>
               <select className="bg-transparent font-semibold text-gray-800 outline-none cursor-pointer">
                 <option>Newest First</option>
                 <option>Highest Salary</option>
               </select>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredJobs.length > 0 ? filteredJobs.map(job => (
              <article key={job.id} className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all group relative overflow-hidden">
                {/* Featured Tag */}
                {job.featured && <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">FEATURED</div>}
                
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Company Logo Placeholder */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-sm ${job.featured ? 'bg-gradient-to-br from-blue-600 to-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                    {job.company[0]}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors cursor-pointer">{job.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                          <span>{job.company}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">Verified</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-y-2 gap-x-6 mt-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {job.loc}</div>
                      <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> {job.type}</div>
                      <div className="flex items-center gap-1.5 font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded"><DollarSign className="w-3.5 h-3.5" /> {job.salary}</div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end mt-4 sm:mt-0">
                    <span className="text-xs text-gray-400 mb-2">{job.posted}</span>
                    <button 
                      onClick={() => openApplyModal(job)}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Quick Apply
                    </button>
                  </div>
                </div>
              </article>
            )) : (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-gray-900 font-bold text-lg">No jobs match your criteria</h3>
                <p className="text-gray-500">Try changing the zone or category filter.</p>
                <button 
                   onClick={() => {setSearch(""); setFilters({location:"", category:"", type:""})}}
                   className="mt-4 text-orange-500 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- QUICK APPLY MODAL (No Login Required) --- */}
      <Modal isOpen={activeModal === 'apply'} onClose={() => setActiveModal(null)} title={`Apply: ${selectedJob?.title}`}>
        <form onSubmit={handleApplySubmit} className="space-y-5">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
            <div className="flex gap-2 font-bold mb-1">
              <Building2 className="w-4 h-4" /> 
              {selectedJob?.company}
            </div>
            <div className="flex gap-2 text-blue-600">
              <MapPin className="w-4 h-4" />
              {selectedJob?.loc}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Amit Kumar" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
              <input type="tel" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="9876543210" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
            <input type="email" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="amit@example.com" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Resume / Portfolio Link</label>
            <input type="url" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Google Drive or LinkedIn Link" />
            <p className="text-xs text-gray-500 mt-1">Or just type "Not Available"</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Why are you a good fit?</label>
            <textarea className="w-full border border-gray-300 p-2.5 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Briefly describe your experience..." required></textarea>
          </div>

          <button className={`w-full ${BRAND.colors.accent} text-white py-3.5 rounded-lg font-bold ${BRAND.colors.accentHover} shadow-lg transition-transform active:scale-95`}>
            Send Application Now
          </button>
          
          <p className="text-center text-xs text-gray-400">
            By applying, you agree to share your details with the recruiter.
          </p>
        </form>
      </Modal>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2 pr-8">
            <h2 className="text-2xl font-extrabold mb-4 tracking-tight">DELHI<span className="text-orange-500">ZONES</span></h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              We are a free job directory connecting local talent with businesses in the National Capital Region. No registration fees for job seekers.
            </p>
            <div className="flex gap-4 mt-6">
              <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"><Globe className="w-4 h-4" /></div>
              <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"><Mail className="w-4 h-4" /></div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-100">Popular Zones</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Jobs in South Delhi</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Jobs in Noida</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Jobs in Gurgaon</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Work from Home</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-100">Support</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">For Employers</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-600 border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p>© 2026 DelhiZones.com. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Made with ❤️ in Delhi</p>
        </div>
      </footer>
    </div>
  );
}