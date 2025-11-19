import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const TARGET_SEATS = 15000;
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ROWS_PER_SECTION = 50;
const SEATS_PER_ROW = Math.ceil(TARGET_SEATS / (SECTIONS.length * ROWS_PER_SECTION));
const SEAT_SPACING_X = 30;
const SEAT_SPACING_Y = 25;
const START_X = 30;
const START_Y = 30;

// Status distribution (realistic distribution)
const STATUSES = ['available', 'available', 'available', 'available', 'held', 'reserved', 'sold'];
const PRICE_TIERS = [1, 1, 1, 2, 2, 3, 4]; // More lower tier seats

function getRandomStatus() {
  return STATUSES[Math.floor(Math.random() * STATUSES.length)];
}

function getRandomPriceTier() {
  return PRICE_TIERS[Math.floor(Math.random() * PRICE_TIERS.length)];
}

function generateVenue() {
  const sections = [];
  let totalSeats = 0;

  SECTIONS.forEach((sectionId, sectionIndex) => {
    const rows = [];
    
    for (let rowIndex = 1; rowIndex <= ROWS_PER_SECTION; rowIndex++) {
      const seats = [];
      const actualSeatsPerRow = rowIndex <= ROWS_PER_SECTION - 2 
        ? SEATS_PER_ROW 
        : Math.floor(SEATS_PER_ROW * 0.8); // Last 2 rows have fewer seats
      
      for (let col = 1; col <= actualSeatsPerRow; col++) {
        if (totalSeats >= TARGET_SEATS) break;
        
        const x = START_X + (col - 1) * SEAT_SPACING_X;
        const y = START_Y + (rowIndex - 1) * SEAT_SPACING_Y + sectionIndex * (ROWS_PER_SECTION * SEAT_SPACING_Y + 100);
        
        seats.push({
          id: `${sectionId}-${rowIndex}-${String(col).padStart(2, '0')}`,
          col: col,
          x: x,
          y: y,
          priceTier: getRandomPriceTier(),
          status: getRandomStatus()
        });
        
        totalSeats++;
      }
      
      if (seats.length > 0) {
        rows.push({
          index: rowIndex,
          seats: seats
        });
      }
      
      if (totalSeats >= TARGET_SEATS) break;
    }
    
    if (rows.length > 0) {
      sections.push({
        id: sectionId,
        label: `Section ${sectionId}`,
        transform: {
          x: 0,
          y: 0,
          scale: 1
        },
        rows: rows
      });
    }
  });

  // Calculate map dimensions
  let maxX = 0;
  let maxY = 0;
  
  sections.forEach(section => {
    section.rows.forEach(row => {
      row.seats.forEach(seat => {
        maxX = Math.max(maxX, seat.x);
        maxY = Math.max(maxY, seat.y);
      });
    });
  });

  const venue = {
    venueId: "arena-01-large",
    name: "Metropolis Arena (Large)",
    map: {
      width: maxX + 50,
      height: maxY + 50
    },
    sections: sections
  };

  return venue;
}

// Generate and save
console.log('Generating venue with ~15,000 seats...');
const venue = generateVenue();

// Count total seats
const totalSeats = venue.sections.reduce((sum, section) => 
  sum + section.rows.reduce((rowSum, row) => rowSum + row.seats.length, 0), 0
);

console.log(`Generated ${totalSeats} seats across ${venue.sections.length} sections`);
console.log(`Map dimensions: ${venue.map.width} x ${venue.map.height}`);

const outputPath = join(__dirname, '../public/venue-generated.json');
writeFileSync(outputPath, JSON.stringify(venue, null, 2), 'utf-8');

console.log(`✅ Venue data saved to: ${outputPath}`);
console.log(`📊 Statistics:`);
console.log(`   - Total seats: ${totalSeats}`);
console.log(`   - Sections: ${venue.sections.length}`);
console.log(`   - Total rows: ${venue.sections.reduce((sum, s) => sum + s.rows.length, 0)}`);

