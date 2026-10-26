export const BOOKLEAF_KNOWLEDGE_BASE = {
  company: {
    name: 'BookLeaf Publishing',
    overview: 'BookLeaf Publishing is a leading self-publishing company operating in India and the US, processing 1,200+ titles monthly.',
    packages: 'Standard Free (no upfront cost) and Bestseller Breakthrough (premium paid package with marketing and distribution add-ons).',
    printing_facility: 'In-house printing and warehouse located in Delhi. Trusted print partners include Repro India and Epitome Books.',
  },
  royalty_policy: {
    split: '80/20 royalty split: 80% of net profit per book to the author, 20% to BookLeaf.',
    net_profit_calculation: 'Net profit = MRP minus printing cost, platform commission (Amazon/Flipkart), and shipping charges.',
    payment_cycle: 'Calculated quarterly and paid within 45 days following the quarter end.',
    minimum_threshold: '₹1,000 minimum payout threshold. If accumulated royalties are below ₹1,000, they roll over to the next quarter.',
    payout_method: 'Direct bank transfer to the account linked in the author dashboard.',
    transparency: 'Detailed royalty breakdown available in the author dashboard showing sales figures per platform.',
  },
  isbn_policy: {
    assignment: 'Every book published through BookLeaf receives a unique ISBN assigned by BookLeaf under BookLeaf imprint.',
    custom_imprint: 'If an author desires an ISBN under their own imprint, they must procure it independently.',
    error_handling: 'ISBN errors (duplicate, incorrect book linked on Amazon/Flipkart) are treated as High Priority and escalated immediately to production with a 48-hour resolution timeline.',
  },
  printing_and_quality: {
    production: 'In-house printing handles most orders; overflow or specialized formats go to Repro India or Epitome Books.',
    turnaround: 'Standard print turnaround is 5–7 business days from order confirmation.',
    quality_defects: 'If an author reports a quality issue (misprints, binding defects, color inconsistency), BookLeaf arranges a free reprint after verification upon receiving photographs of the defective copy.',
  },
  distribution_and_availability: {
    platforms: 'Listed on Amazon India, Flipkart, Amazon US, Amazon UK, and the BookLeaf Store.',
    listing_time: 'New listings typically go live within 7–10 business days after publication is completed.',
    stock_sync: 'If a published book shows as "Currently Unavailable" on Amazon/Flipkart, it indicates a stock sync delay. BookLeaf triggers a re-sync with the distribution team within 24–48 hours.',
  },
  production_stages: {
    workflow: 'Manuscript Received -> Editing (if opted) -> Cover Design -> Typesetting -> Proofreading -> ISBN Assignment -> Printing -> Distribution Setup -> Published & Live.',
    delay_points: 'Delays typically occur at Cover Design (awaiting author approval) and Proofreading (revision rounds). Authors are updated via email at each stage.',
  },
  tone_guidelines: [
    'Always empathetic and professional. Authors are partners, not customers to be managed.',
    'Acknowledge the author\'s specific concern before jumping into solutions.',
    'Be specific: include actual numbers, dates, and statuses rather than vague reassurances.',
    'If something is BookLeaf\'s fault (delayed royalties, ISBN error), own it directly without corporate deflection.',
    'Give clear resolution timelines (e.g., "Our team will look into this and get back to you within 48 hours").',
    'Always end with a clear next step for the author and/or the BookLeaf team.',
  ],
};

/**
 * Returns targeted policy context based on the detected category and keywords,
 * avoiding sending the entire database/knowledge base on every API call.
 */
export const getRelevantPolicyContext = (category, queryText = '') => {
  const sections = [];
  const lowerQuery = (queryText || '').toLowerCase();

  sections.push(`Company Context: ${BOOKLEAF_KNOWLEDGE_BASE.company.overview}`);

  if (category === 'Royalty & Payments' || lowerQuery.includes('royalt') || lowerQuery.includes('payout') || lowerQuery.includes('money')) {
    sections.push(`Royalty Policy:\n- Split: ${BOOKLEAF_KNOWLEDGE_BASE.royalty_policy.split}\n- Net Profit: ${BOOKLEAF_KNOWLEDGE_BASE.royalty_policy.net_profit_calculation}\n- Cycle: ${BOOKLEAF_KNOWLEDGE_BASE.royalty_policy.payment_cycle}\n- Threshold: ${BOOKLEAF_KNOWLEDGE_BASE.royalty_policy.minimum_threshold}\n- Payouts: ${BOOKLEAF_KNOWLEDGE_BASE.royalty_policy.payout_method}`);
  }

  if (category === 'ISBN & Metadata Issues' || lowerQuery.includes('isbn') || lowerQuery.includes('title') || lowerQuery.includes('metadata')) {
    sections.push(`ISBN Policy:\n- Assignment: ${BOOKLEAF_KNOWLEDGE_BASE.isbn_policy.assignment}\n- Errors: ${BOOKLEAF_KNOWLEDGE_BASE.isbn_policy.error_handling}`);
  }

  if (category === 'Printing & Quality' || lowerQuery.includes('print') || lowerQuery.includes('quality') || lowerQuery.includes('damage') || lowerQuery.includes('copy')) {
    sections.push(`Printing & Quality Policy:\n- Turnaround: ${BOOKLEAF_KNOWLEDGE_BASE.printing_and_quality.turnaround}\n- Defective Copies: ${BOOKLEAF_KNOWLEDGE_BASE.printing_and_quality.quality_defects}`);
  }

  if (category === 'Distribution & Availability' || lowerQuery.includes('amazon') || lowerQuery.includes('flipkart') || lowerQuery.includes('unavailable') || lowerQuery.includes('stock')) {
    sections.push(`Distribution Policy:\n- Platforms: ${BOOKLEAF_KNOWLEDGE_BASE.distribution_and_availability.platforms}\n- Timeline: ${BOOKLEAF_KNOWLEDGE_BASE.distribution_and_availability.listing_time}\n- Availability issues: ${BOOKLEAF_KNOWLEDGE_BASE.distribution_and_availability.stock_sync}`);
  }

  if (category === 'Book Status & Production Updates' || lowerQuery.includes('status') || lowerQuery.includes('stage') || lowerQuery.includes('typeset') || lowerQuery.includes('proof')) {
    sections.push(`Production Stages:\n- Workflow: ${BOOKLEAF_KNOWLEDGE_BASE.production_stages.workflow}\n- Delays: ${BOOKLEAF_KNOWLEDGE_BASE.production_stages.delay_points}`);
  }

  sections.push(`Tone Guidelines:\n${BOOKLEAF_KNOWLEDGE_BASE.tone_guidelines.map(t => `- ${t}`).join('\n')}`);

  return sections.join('\n\n');
};
