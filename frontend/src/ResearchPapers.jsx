import { useState, useEffect } from 'react';
import './ResearchPapers.css';

export default function ResearchPapers() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [researchPapers, setResearchPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');
  const categories = ['All', 'Cardiology', 'Oncology', 'Neurology', 'Infectious Diseases', 'Diabetes', 'Public Health', 'Mental Health', 'Pediatrics', 'Dermatology', 'Orthopedics'];

  useEffect(() => {
    fetchResearchPapers();
  }, []);

  const fetchResearchPapers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/research-papers', {
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      if (data.ok) {
        setResearchPapers(data.papers || []);
      }
    } catch (err) {
      console.error('Failed to fetch research papers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaperClick = async (paper) => {
    setSelectedPaper(paper);
    
    // Increment views when paper is opened
    try {
      await fetch(`/api/research-papers/${paper._id}`, {
        headers: { 'x-user-id': userId }
      });
    } catch (err) {
      console.error('Failed to track view:', err);
    }
  };

  const defaultPapers = [
    {
      id: 1,
      category: 'Cardiology',
      title: 'Impact of Mediterranean Diet on Cardiovascular Health',
      authors: 'Dr. Rahman Ahmed, Dr. Fatima Sultana, Dr. Kamal Hassan',
      journal: 'Bangladesh Journal of Cardiology',
      year: 2024,
      abstract: 'This comprehensive study examines the effects of Mediterranean diet patterns on cardiovascular health outcomes in South Asian populations. Our research involved 1,200 participants over a 5-year period, showing significant reduction in cardiovascular events, improved lipid profiles, and better blood pressure control.',
      keywords: ['Mediterranean Diet', 'Cardiovascular Disease', 'Prevention', 'Nutrition'],
      doi: '10.1234/bjc.2024.001',
      citations: 45,
      link: '#',
      keyFindings: [
        '32% reduction in major cardiovascular events',
        'Significant improvement in HDL cholesterol levels',
        'Better blood pressure control in 67% of participants',
        'Reduced inflammation markers'
      ]
    },
    {
      id: 2,
      category: 'Diabetes',
      title: 'Prevalence and Management of Type 2 Diabetes in Bangladesh',
      authors: 'Dr. Nusrat Jahan, Dr. Imran Khan, Dr. Shabana Akter',
      journal: 'Diabetes Research International',
      year: 2024,
      abstract: 'A nationwide study analyzing the prevalence, risk factors, and management strategies for Type 2 Diabetes Mellitus in Bangladesh. The study covers 15,000 adults across urban and rural areas, revealing alarming trends and proposing community-based intervention strategies.',
      keywords: ['Type 2 Diabetes', 'Prevalence', 'Bangladesh', 'Public Health'],
      doi: '10.5678/dri.2024.012',
      citations: 78,
      link: '#',
      keyFindings: [
        '12.4% prevalence in adults aged 20-79',
        'Higher rates in urban areas (15.2%) vs rural (9.8%)',
        'Only 45% of diagnosed patients achieve glycemic control',
        'Community health workers improve outcomes by 28%'
      ]
    },
    {
      id: 3,
      category: 'Infectious Diseases',
      title: 'Antibiotic Resistance Patterns in Bangladesh: A Critical Review',
      authors: 'Dr. Mahbub Rahman, Dr. Ayesha Siddiqua, Dr. Tarek Hossain',
      journal: 'Journal of Antimicrobial Research',
      year: 2024,
      abstract: 'This critical review examines antibiotic resistance patterns in common bacterial infections across Bangladesh. The study highlights alarming resistance rates to commonly prescribed antibiotics and proposes antimicrobial stewardship programs.',
      keywords: ['Antibiotic Resistance', 'AMR', 'Bangladesh', 'Stewardship'],
      doi: '10.9012/jar.2024.089',
      citations: 112,
      link: '#',
      keyFindings: [
        '78% E. coli strains resistant to common antibiotics',
        'Increasing MRSA prevalence in hospitals',
        'Inappropriate antibiotic prescribing in 62% of cases',
        'Urgent need for national AMR surveillance'
      ]
    },
    {
      id: 4,
      category: 'Public Health',
      title: 'Maternal and Child Health Outcomes in Rural Bangladesh',
      authors: 'Dr. Roksana Begum, Dr. Abdul Latif, Dr. Yasmin Ara',
      journal: 'South Asian Journal of Public Health',
      year: 2024,
      abstract: 'A comprehensive analysis of maternal and child health indicators in rural Bangladesh, examining the impact of community health initiatives, skilled birth attendance, and nutrition programs on health outcomes.',
      keywords: ['Maternal Health', 'Child Health', 'Rural Health', 'Bangladesh'],
      doi: '10.3456/sajph.2024.034',
      citations: 56,
      link: '#',
      keyFindings: [
        'Maternal mortality reduced by 35% in intervention areas',
        'Skilled birth attendance increased to 78%',
        'Childhood malnutrition decreased by 22%',
        'Immunization coverage reached 92%'
      ]
    },
    {
      id: 5,
      category: 'Mental Health',
      title: 'Depression and Anxiety Prevalence Among University Students',
      authors: 'Dr. Farhana Haque, Dr. Saiful Islam, Dr. Nasrin Sultana',
      journal: 'Asian Journal of Psychiatry',
      year: 2024,
      abstract: 'This study investigates the prevalence of depression and anxiety among university students in Bangladesh, identifying key risk factors and evaluating the effectiveness of campus-based mental health interventions.',
      keywords: ['Depression', 'Anxiety', 'Students', 'Mental Health'],
      doi: '10.7890/ajp.2024.067',
      citations: 89,
      link: '#',
      keyFindings: [
        '34% of students screened positive for depression',
        '41% reported moderate to severe anxiety',
        'Academic pressure identified as primary stressor',
        'Peer support programs reduced symptoms by 28%'
      ]
    },
    {
      id: 6,
      category: 'Oncology',
      title: 'Breast Cancer Screening and Early Detection in Bangladesh',
      authors: 'Dr. Shamima Rahman, Dr. Mizanur Rahman, Dr. Dilruba Nasrin',
      journal: 'Bangladesh Cancer Research Journal',
      year: 2023,
      abstract: 'An extensive study on breast cancer screening practices, awareness levels, and early detection rates in Bangladesh. The research proposes culturally appropriate screening programs to improve early detection and survival rates.',
      keywords: ['Breast Cancer', 'Screening', 'Early Detection', 'Bangladesh'],
      doi: '10.2345/bcrj.2023.078',
      citations: 67,
      link: '#',
      keyFindings: [
        'Only 23% of women aware of self-breast examination',
        '68% of cases diagnosed at advanced stages',
        'Community-based screening increased detection by 42%',
        'Mobile screening units reached 50,000 women'
      ]
    },
    {
      id: 7,
      category: 'Neurology',
      title: 'Stroke Prevalence and Risk Factors in Urban Bangladesh',
      authors: 'Dr. Quazi Deen Mohammad, Dr. Mansur Habib, Dr. Firdaus Ara',
      journal: 'Neurology Asia',
      year: 2023,
      abstract: 'A population-based study examining stroke prevalence, risk factors, and outcomes in urban Bangladesh. The research identifies modifiable risk factors and proposes preventive strategies tailored to local context.',
      keywords: ['Stroke', 'Cerebrovascular Disease', 'Risk Factors', 'Bangladesh'],
      doi: '10.4567/na.2023.123',
      citations: 92,
      link: '#',
      keyFindings: [
        'Stroke prevalence: 1.47% in adults over 40',
        'Hypertension present in 78% of stroke patients',
        'Only 15% received thrombolysis within golden hour',
        'Public awareness campaigns reduced risk by 18%'
      ]
    },
    {
      id: 8,
      category: 'Public Health',
      title: 'Air Pollution and Respiratory Health in Dhaka City',
      authors: 'Dr. Bilkis Ara Begum, Dr. Shahriar Hossain, Dr. Mahmuda Akter',
      journal: 'Environmental Health Perspectives',
      year: 2023,
      abstract: 'This study investigates the relationship between air pollution levels and respiratory health outcomes in Dhaka city. Long-term exposure data is correlated with respiratory disease incidence, hospital admissions, and mortality.',
      keywords: ['Air Pollution', 'Respiratory Health', 'Dhaka', 'Environmental Health'],
      doi: '10.6789/ehp.2023.456',
      citations: 134,
      link: '#',
      keyFindings: [
        'PM2.5 levels exceeded WHO guidelines by 12 times',
        '45% increase in respiratory hospital admissions',
        'Children and elderly most affected',
        'Green spaces reduced respiratory symptoms by 23%'
      ]
    },
    {
      id: 9,
      category: 'Infectious Diseases',
      title: 'COVID-19 Vaccination Coverage and Hesitancy in Bangladesh',
      authors: 'Dr. Meerjady Sabrina Flora, Dr. Tahmina Shirin, Dr. Mustafizur Rahman',
      journal: 'Vaccine Research International',
      year: 2023,
      abstract: 'A comprehensive analysis of COVID-19 vaccination coverage, acceptance, and hesitancy factors in Bangladesh. The study identifies barriers to vaccination and successful strategies to improve uptake.',
      keywords: ['COVID-19', 'Vaccination', 'Vaccine Hesitancy', 'Bangladesh'],
      doi: '10.8901/vri.2023.234',
      citations: 156,
      link: '#',
      keyFindings: [
        '78% of eligible population received at least one dose',
        'Misinformation primary cause of hesitancy',
        'Community leaders increased acceptance by 34%',
        'Mobile vaccination teams reached remote areas'
      ]
    },
    {
      id: 10,
      category: 'Cardiology',
      title: 'Hypertension Control and Management in Primary Care',
      authors: 'Dr. Sohel Reza Choudhury, Dr. Afroza Begum, Dr. Harun Rashid',
      journal: 'Hypertension Research',
      year: 2023,
      abstract: 'This study evaluates hypertension control rates and management practices in primary care settings across Bangladesh. It assesses the effectiveness of various treatment protocols and patient adherence.',
      keywords: ['Hypertension', 'Primary Care', 'Blood Pressure Control', 'Bangladesh'],
      doi: '10.1357/hr.2023.567',
      citations: 71,
      link: '#',
      keyFindings: [
        '32% of hypertensive patients achieve blood pressure control',
        'Medication adherence only 56%',
        'Lifestyle modifications improve outcomes by 41%',
        'Home blood pressure monitoring increases control rates'
      ]
    }
  ];

  const filteredPapers = researchPapers.filter(paper => {
    const matchesCategory = selectedCategory === 'All' || paper.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="research-papers-container">
      {/* Header */}
      <div className="research-header">
        <div className="research-title-section">
          <h1>
            <span>📚</span>
            Medical Research Papers
          </h1>
          <p>Latest research publications from Bangladesh medical community</p>
        </div>
      </div>

      {/* Filters */}
      <div className="research-filters">
        <div className="category-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Search by title, authors, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Papers List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', color: 'var(--color-text-muted)' }}>
            Loading research papers...
          </p>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No Papers Found</h3>
          <p>Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="papers-list">
          {filteredPapers.map(paper => (
            <div key={paper._id || paper.id} className="paper-card" onClick={() => handlePaperClick(paper)}>
              <div className="paper-header">
                <span className="paper-category-badge">{paper.category}</span>
                <span className="paper-year">{paper.year}</span>
              </div>
              <h3>{paper.title}</h3>
              <p className="paper-authors">{paper.authors}</p>
              <p className="paper-journal">
                <span className="journal-icon">📖</span>
                {paper.journal}
              </p>
              <div className="paper-keywords">
                {paper.keywords?.map((keyword, idx) => (
                  <span key={idx} className="keyword-tag">{keyword}</span>
                ))}
              </div>
              <div className="paper-footer">
                <span className="citations">
                  <span>📊</span>
                  {paper.citations} citations
                </span>
                <span className="views">
                  <span>👁️</span>
                  {paper.views || 0} views
                </span>
                <span className="doi">DOI: {paper.doi}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedPaper && (
        <div className="modal-overlay" onClick={() => setSelectedPaper(null)}>
          <div className="paper-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedPaper(null)}>✕</button>
            <div className="modal-header">
              <span className="modal-category-badge">{selectedPaper.category}</span>
              <span className="modal-year">{selectedPaper.year}</span>
            </div>
            <h2>{selectedPaper.title}</h2>
            <p className="modal-authors"><strong>Authors:</strong> {selectedPaper.authors}</p>
            <p className="modal-journal"><strong>Journal:</strong> {selectedPaper.journal}</p>
            <p className="modal-doi"><strong>DOI:</strong> {selectedPaper.doi}</p>
            
            <div className="modal-section">
              <h3>Abstract</h3>
              <p>{selectedPaper.abstract}</p>
            </div>

            <div className="modal-section">
              <h3>Key Findings</h3>
              <ul className="findings-list">
                {selectedPaper.keyFindings.map((finding, idx) => (
                  <li key={idx}>{finding}</li>
                ))}
              </ul>
            </div>

            <div className="modal-section">
              <h3>Keywords</h3>
              <div className="modal-keywords">
                {selectedPaper.keywords.map((keyword, idx) => (
                  <span key={idx} className="keyword-tag">{keyword}</span>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <span className="modal-citations">📊 {selectedPaper.citations} citations</span>
              <button className="read-full-btn" onClick={() => window.open(selectedPaper.link, '_blank')}>
                Read Full Paper →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
