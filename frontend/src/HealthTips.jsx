import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import './HealthTips.css';

export default function HealthTips() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [healthTips, setHealthTips] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');
  const categories = ['All', 'Nutrition', 'Exercise', 'Mental Health', 'Sleep', 'Hygiene', 'Preventive Care', 'Lifestyle'];

  useEffect(() => {
    fetchHealthTips();
  }, []);

  const fetchHealthTips = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/health-tips', {
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      if (data.ok) {
        setHealthTips(data.tips || []);
      }
    } catch (err) {
      console.error('Failed to fetch health tips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (tipId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/health-tips/${tipId}/like`, {
        method: 'POST',
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      if (data.ok) {
        // Update local state
        setHealthTips(tips => tips.map(tip => 
          tip._id === tipId 
            ? { ...tip, likes: data.isLiked ? [...(tip.likes || []), userId] : (tip.likes || []).filter(id => id !== userId) }
            : tip
        ));
      }
    } catch (err) {
      console.error('Failed to like tip:', err);
    }
  };

  const defaultTips = [
    // Nutrition Tips
    {
      id: 1,
      category: 'Nutrition',
      title: 'Stay Hydrated Throughout the Day',
      icon: '💧',
      content: 'Drink at least 8-10 glasses of water daily. Proper hydration helps maintain body temperature, keeps joints lubricated, prevents infections, delivers nutrients to cells, and keeps organs functioning properly.',
      tips: [
        'Start your day with a glass of water',
        'Keep a water bottle with you',
        'Drink before you feel thirsty',
        'Eat water-rich foods like cucumber and watermelon'
      ]
    },
    {
      id: 2,
      category: 'Nutrition',
      title: 'Eat a Rainbow of Fruits and Vegetables',
      icon: '🥗',
      content: 'Different colored fruits and vegetables provide different nutrients. Aim for at least 5 servings of fruits and vegetables daily to get a wide range of vitamins, minerals, and antioxidants.',
      tips: [
        'Include leafy greens in your meals',
        'Snack on fresh fruits',
        'Try new vegetables each week',
        'Local seasonal produce is best and affordable'
      ]
    },
    {
      id: 3,
      category: 'Nutrition',
      title: 'Reduce Processed Sugar Intake',
      icon: '🍬',
      content: 'Excessive sugar consumption can lead to obesity, diabetes, and heart disease. Limit sugary drinks, sweets, and processed foods. Read labels to identify hidden sugars.',
      tips: [
        'Replace sugary drinks with water or green tea',
        'Choose whole fruits over fruit juices',
        'Use natural sweeteners like honey in moderation',
        'Avoid foods with high fructose corn syrup'
      ]
    },

    // Exercise Tips
    {
      id: 4,
      category: 'Exercise',
      title: 'Exercise at Least 30 Minutes Daily',
      icon: '🏃',
      content: 'Regular physical activity strengthens your heart, improves circulation, helps maintain a healthy weight, and reduces the risk of chronic diseases. Even light exercise is beneficial.',
      tips: [
        'Take a brisk walk after meals',
        'Use stairs instead of elevators',
        'Try yoga or stretching exercises',
        'Join a local sports club or gym'
      ]
    },
    {
      id: 5,
      category: 'Exercise',
      title: 'Incorporate Strength Training',
      icon: '💪',
      content: 'Strength training builds muscle mass, increases bone density, improves balance, and boosts metabolism. You don\'t need expensive equipment - bodyweight exercises work great.',
      tips: [
        'Start with push-ups and squats',
        'Use resistance bands or water bottles as weights',
        'Practice twice a week',
        'Always warm up before exercising'
      ]
    },

    // Mental Health Tips
    {
      id: 6,
      category: 'Mental Health',
      title: 'Practice Mindfulness and Meditation',
      icon: '🧘',
      content: 'Regular meditation reduces stress, anxiety, and depression. Just 10-15 minutes daily can improve focus, emotional well-being, and overall mental health.',
      tips: [
        'Start with 5 minutes of deep breathing',
        'Use meditation apps or YouTube videos',
        'Find a quiet space for practice',
        'Be consistent with your practice'
      ]
    },
    {
      id: 7,
      category: 'Mental Health',
      title: 'Maintain Social Connections',
      icon: '👥',
      content: 'Strong social relationships improve mental health, increase longevity, and provide emotional support. Stay connected with family and friends regularly.',
      tips: [
        'Call or visit loved ones regularly',
        'Join community groups or clubs',
        'Volunteer for social causes',
        'Don\'t isolate yourself when feeling down'
      ]
    },
    {
      id: 8,
      category: 'Mental Health',
      title: 'Limit Screen Time Before Bed',
      icon: '📱',
      content: 'Blue light from screens interferes with melatonin production and disrupts sleep. Reduce screen time at least 1 hour before bedtime for better sleep quality.',
      tips: [
        'Use night mode on devices',
        'Read a book instead of scrolling',
        'Keep phones out of the bedroom',
        'Set a screen curfew time'
      ]
    },

    // Sleep Tips
    {
      id: 9,
      category: 'Sleep',
      title: 'Get 7-8 Hours of Quality Sleep',
      icon: '😴',
      content: 'Adequate sleep is crucial for physical health, mental well-being, and cognitive function. Poor sleep is linked to obesity, heart disease, and reduced immunity.',
      tips: [
        'Maintain a consistent sleep schedule',
        'Create a dark, quiet sleeping environment',
        'Avoid caffeine after 2 PM',
        'Keep bedroom temperature cool'
      ]
    },
    {
      id: 10,
      category: 'Sleep',
      title: 'Establish a Bedtime Routine',
      icon: '🌙',
      content: 'A consistent bedtime routine signals your body that it\'s time to sleep. This helps regulate your circadian rhythm and improves sleep quality.',
      tips: [
        'Take a warm bath before bed',
        'Read or listen to calming music',
        'Practice light stretching',
        'Write in a gratitude journal'
      ]
    },

    // Hygiene Tips
    {
      id: 11,
      category: 'Hygiene',
      title: 'Wash Hands Regularly and Properly',
      icon: '🧼',
      content: 'Proper handwashing is the best way to prevent the spread of infections and diseases. Wash hands with soap for at least 20 seconds, especially before eating and after using the bathroom.',
      tips: [
        'Use soap and clean running water',
        'Scrub all surfaces including under nails',
        'Wash for at least 20 seconds',
        'Carry hand sanitizer when soap isn\'t available'
      ]
    },
    {
      id: 12,
      category: 'Hygiene',
      title: 'Maintain Oral Hygiene',
      icon: '🦷',
      content: 'Good oral hygiene prevents tooth decay, gum disease, and bad breath. Brush twice daily, floss regularly, and visit your dentist every 6 months.',
      tips: [
        'Brush for 2 minutes twice daily',
        'Use fluoride toothpaste',
        'Floss between teeth daily',
        'Replace toothbrush every 3 months'
      ]
    },

    // Preventive Care Tips
    {
      id: 13,
      category: 'Preventive Care',
      title: 'Get Regular Health Checkups',
      icon: '🩺',
      content: 'Regular health screenings can detect diseases early when they\'re most treatable. Annual checkups, blood tests, and age-appropriate screenings are essential.',
      tips: [
        'Schedule annual physical exams',
        'Monitor blood pressure and blood sugar',
        'Get age-appropriate cancer screenings',
        'Keep vaccination records updated'
      ]
    },
    {
      id: 14,
      category: 'Preventive Care',
      title: 'Stay Up to Date with Vaccinations',
      icon: '💉',
      content: 'Vaccines protect you and your community from serious diseases. Ensure you and your children receive all recommended vaccines on schedule.',
      tips: [
        'Follow the national immunization schedule',
        'Get annual flu shots',
        'Don\'t skip booster doses',
        'Consult your doctor about travel vaccines'
      ]
    },
    {
      id: 15,
      category: 'Preventive Care',
      title: 'Protect Your Skin from Sun Damage',
      icon: '☀️',
      content: 'Excessive sun exposure can cause skin cancer, premature aging, and eye damage. Protect your skin, especially during peak sun hours (10 AM - 4 PM).',
      tips: [
        'Use sunscreen with SPF 30+',
        'Wear protective clothing and hats',
        'Seek shade during peak hours',
        'Wear UV-blocking sunglasses'
      ]
    },

    // Lifestyle Tips
    {
      id: 16,
      category: 'Lifestyle',
      title: 'Avoid Tobacco and Limit Alcohol',
      icon: '🚭',
      content: 'Tobacco use is the leading cause of preventable death. Smoking and excessive alcohol consumption increase the risk of cancer, heart disease, and liver damage.',
      tips: [
        'Quit smoking - seek professional help if needed',
        'Avoid secondhand smoke exposure',
        'Limit alcohol to moderate amounts',
        'Replace bad habits with healthy activities'
      ]
    },
    {
      id: 17,
      category: 'Lifestyle',
      title: 'Manage Stress Effectively',
      icon: '🌸',
      content: 'Chronic stress weakens the immune system and increases disease risk. Learn healthy ways to cope with stress through relaxation techniques and time management.',
      tips: [
        'Practice deep breathing exercises',
        'Take regular breaks during work',
        'Engage in hobbies you enjoy',
        'Seek professional help when needed'
      ]
    },
    {
      id: 18,
      category: 'Lifestyle',
      title: 'Maintain a Healthy Weight',
      icon: '⚖️',
      content: 'Being overweight or underweight increases health risks. Maintain a healthy weight through balanced nutrition and regular physical activity.',
      tips: [
        'Calculate your BMI regularly',
        'Set realistic weight goals',
        'Avoid crash diets',
        'Focus on sustainable lifestyle changes'
      ]
    },
    {
      id: 19,
      category: 'Lifestyle',
      title: 'Stay Mentally Active',
      icon: '🧩',
      content: 'Mental stimulation helps maintain cognitive function and may reduce the risk of dementia. Keep your brain active with challenging activities.',
      tips: [
        'Learn new skills or languages',
        'Solve puzzles and brain teasers',
        'Read books regularly',
        'Engage in creative activities'
      ]
    },
    {
      id: 20,
      category: 'Lifestyle',
      title: 'Practice Good Posture',
      icon: '🪑',
      content: 'Poor posture can lead to back pain, neck pain, and other musculoskeletal problems. Be mindful of your posture while sitting, standing, and sleeping.',
      tips: [
        'Keep your back straight while sitting',
        'Use ergonomic furniture',
        'Take breaks from prolonged sitting',
        'Strengthen core muscles'
      ]
    }
  ];

  const filteredTips = healthTips.filter(tip => {
    const matchesCategory = selectedCategory === 'All' || tip.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="health-tips-container">
      {/* Header */}
      <div className="health-tips-header">
        <div className="health-tips-title-section">
          <h1>
            <span>💡</span>
            Health Tips & Wellness Guide
          </h1>
          <p>Expert-curated health tips for a healthier lifestyle</p>
        </div>
      </div>

      {/* Filters */}
      <div className="health-tips-filters">
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
          placeholder="Search health tips..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tips Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', color: 'var(--color-text-muted)' }}>
            Loading health tips...
          </p>
        </div>
      ) : filteredTips.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No Tips Found</h3>
          <p>Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="tips-grid">
          {filteredTips.map(tip => (
            <div key={tip._id || tip.id} className="tip-card">
              <div className="tip-header">
                <div className="tip-icon">{tip.icon}</div>
                <span className="tip-category-badge">{tip.category}</span>
              </div>
              <h3>{tip.title}</h3>
              <p className="tip-content">{tip.content}</p>
              <div className="tip-list">
                <h4>Quick Tips:</h4>
                <ul>
                  {tip.tips.map((t, idx) => (
                    <li key={idx}>✓ {t}</li>
                  ))}
                </ul>
              </div>
              <div className="tip-footer">
                <div className="tip-stats">
                  <span className="tip-stat">
                    <span>👁️</span> {tip.views || 0}
                  </span>
                  <button 
                    className={`tip-like-btn ${tip.likes?.includes(userId) ? 'liked' : ''}`}
                    onClick={(e) => handleLike(tip._id, e)}
                  >
                    <span>❤️</span> {tip.likes?.length || 0}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
