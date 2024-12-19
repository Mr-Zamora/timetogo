# Changelog for TimeToGo Timer Application

## [Unreleased]

### Added
- Comprehensive color progression for progress bar
- Granular color transitions to improve user experience
- Disabled link functionality for About page during active timer
- Enhanced responsive design for mobile devices
- Expanded view font size enhancements
- Dark/Light mode toggle switch

### Expanded View Improvements
- Updated font sizes for expanded timer view:
  - Timer Title: Increased from 2.5rem to 3.5rem
  - Start and End Times: Increased from 3.5rem to 4.5rem
  - Time Remaining: Increased from 2rem to 3.5rem
- Maintained consistent typography hierarchy
- Improved readability for expanded timer state

### Responsive Design Improvements
- Added comprehensive media queries for different screen sizes
- Maintained original layout for start and end times on mobile
- Implemented touch-friendly target sizes
- Disabled expand icon on small mobile resolutions
  - Supports devices up to 932x430 (iPhone Pro Max)
  - Prevents expand functionality on small screens
- Adjusted font sizes for better readability on mobile
- Fine-tuned padding and button sizes for smaller screens

### Dark/Light Mode Improvements
- Implemented theme toggle in copyright notice
- Added persistent theme preference using localStorage
- Created dark mode color palette
- Styled toggle switch with smooth transitions
- Maintained consistent design across light and dark modes

### Theme Toggle Features
- One-click theme switching
- Remembers user's theme preference
- Smooth color transitions
- Accessible design

### Theme Toggle Improvements
- Replaced toggle switch with text-based theme selector
- Integrated theme mode text inline with copyright notice
- Added hover effects for theme mode text
- Implemented uppercase and letter-spacing for better readability
- Maintained persistent theme preference
- Simplified theme switching interaction

### Footer and Copyright Notice Improvements
- Centered copyright notice and theme toggle
- Made footer compact and minimalist
- Implemented transparent background
- Reduced font size
- Simplified theme toggle switch design

### User Interface Improvements
- Added footer hiding when timer card is expanded
- Improved screen real estate usage during timer expansion
- Maintained clean and focused user interface during active timer

### Dark Mode Enhancements
- Added comprehensive dark mode styling for time dropdowns
- Implemented dark background and text colors for dropdown
- Created hover and selected state styles for dropdown items
- Customized scrollbar appearance for dark mode
- Maintained consistent design language across all components

### Dark Mode Dropdown Improvements
- Enhanced dropdown hover state with success color
- Added color and background color change on hover
- Maintained visual consistency with existing color palette

### Dark Mode Dropdown Enhancements
- Updated selected/current item style with success color
- Added success color background and text for active dropdown items
- Maintained bold font weight for selected items
- Improved visual hierarchy and interaction feedback

### Timer Accuracy and Performance Improvements
- Enhanced timer calculation mechanism
- Implemented more precise time tracking across different scenarios
- Added robust handling of timer state during:
  - Page visibility changes
  - Pausing and resuming
  - Background tab switching

#### Technical Implementation Details
- Introduced `elapsedBeforePause` tracking for seamless timer continuation
- Added `document.visibilitychange` event listener to maintain accurate timer state
- Implemented advanced time calculation method that:
  - Tracks exact seconds elapsed
  - Handles timer interruptions gracefully
  - Provides consistent timer experience across different browser states

#### Key Accuracy Enhancements
- Precise second-level timer tracking
- Maintains timer progress even when:
  - Switching browser tabs
  - Minimizing application
  - Experiencing temporary performance interruptions
- Eliminates potential timer drift and synchronization issues

#### Timer State Management
- Developed more intelligent timer state preservation
- Seamless transition between timer states (start, pause, resume)
- Accurate time remaining calculation
- Consistent timer behavior across different user interactions

### Modal Improvements
- Added detailed onboarding modal with feature explanations
- Implemented fixed-width icons for consistent alignment
- Added 1.5 line spacing for better readability
- Included additional feature descriptions:
  - Dark/light mode toggle
  - Fullscreen timer expansion
- Enhanced modal styling with improved text and icon layout
- Added hover effect for "Got it" button
- Ensured left-aligned text with consistent icon spacing

### User Interface Enhancements
- Updated modal background color for improved readability
- Added black text color to modal for better contrast
- Restored time selection dropdowns
- Maintained responsive design principles

### Changes in `timetogo.css`
- Updated CSS variables for progress bar colors
- Added new color palette with 10 distinct color stages
- Implemented `.disabled-link` CSS class for footer links
  - Reduces opacity
  - Prevents pointer events
  - Changes cursor to `not-allowed`
- Updated responsive design media queries
- Added device-specific styling for mobile views
- Implemented responsive typography
- Created touch-friendly interaction zones

### Changes in `timetogo.js`
- Enhanced `progressColors` object with new color variables
- Added `preventNavigation()` method to handle link clicks during active timer
- Modified `toggleTimer()` method to:
  - Disable About page link when timer starts
  - Re-enable About page link when timer is paused
  - Prevent accidental navigation during active timer

### Changes in `index.html`
- Updated modal inline styles
- Added comprehensive dropdown menus for time selection
- Improved modal text and icon layout
- Enhanced modal interaction and readability

### Deployment
- Committed and deployed to GitHub Pages
- Live site: [https://mr-zamora.github.io/timetogo/](https://mr-zamora.github.io/timetogo/)
- Deployment Date: 2024-12-19

### Color Progression Stages
0. 0-10%: Deep Green (#28a745)
1. 11-20%: Lighter Green (#4cb342)
2. 21-30%: Yellow-green blend (#6abf3b)
3. 31-40%: Balanced yellow-green (#88d227)
4. 41-50%: Light green-yellow (#a5e132)
5. 51-60%: Soft yellow-orange (#ffd633)
6. 61-70%: Yellow-orange (#ffbf33)
7. 71-80%: Bright orange (#ff9933)
8. 81-90%: Light red-orange (#e36454)
9. 91-100%: Deep Red (#dc3545)

### User Experience Improvements
- Smoother color transitions
- Clear visual feedback during timer progression
- Prevented unintended navigation during active timer
- Maintained full timer functionality
- Improved mobile responsiveness

## Future Considerations
- Potential customization of color progression
- Additional timer management features
- Persistent timer settings
- Further mobile device testing and optimization

---

*Last Updated: 2024-12-19*
