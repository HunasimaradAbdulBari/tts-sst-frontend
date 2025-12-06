/**
 * Circle Gesture Detector (Samsung S25 Style)
 * Detects when user draws a circle gesture to select text
 */

class CircleGestureDetector {
  constructor(options = {}) {
    this.points = [];
    this.startPoint = null;
    this.isDrawing = false;
    
    // Configuration
    this.minPoints = options.minPoints || 15;
    this.maxPoints = options.maxPoints || 200;
    this.closeThreshold = options.closeThreshold || 50; // pixels
    this.minPerimeter = options.minPerimeter || 100; // pixels
    this.circularityThreshold = options.circularityThreshold || 0.5; // 0-1, higher = more circular
    this.maxDrawTime = options.maxDrawTime || 5000; // ms
    
    this.startTime = null;
  }

  startGesture(x, y) {
    this.points = [{ x, y, timestamp: Date.now() }];
    this.startPoint = { x, y };
    this.isDrawing = true;
    this.startTime = Date.now();
  }

  addPoint(x, y) {
    if (!this.isDrawing) return false;
    
    const timestamp = Date.now();
    
    // Check timeout
    if (timestamp - this.startTime > this.maxDrawTime) {
      this.reset();
      return false;
    }
    
    // Avoid duplicate points
    const lastPoint = this.points[this.points.length - 1];
    const distance = this.distance(lastPoint, { x, y });
    
    if (distance > 5) { // Minimum movement
      this.points.push({ x, y, timestamp });
      
      // Limit points to prevent memory issues
      if (this.points.length > this.maxPoints) {
        this.points.shift();
      }
    }
    
    return true;
  }

  endGesture() {
    if (!this.isDrawing || this.points.length < this.minPoints) {
      this.reset();
      return null;
    }
    
    const result = this.isCircleGesture();
    this.isDrawing = false;
    
    return result;
  }

  isCircleGesture() {
    if (this.points.length < this.minPoints) {
      return null;
    }
    
    // 1. Check if start and end are close (closed loop)
    const startPoint = this.points[0];
    const endPoint = this.points[this.points.length - 1];
    const closureDistance = this.distance(startPoint, endPoint);
    
    if (closureDistance > this.closeThreshold) {
      return null; // Not closed
    }
    
    // 2. Calculate perimeter
    const perimeter = this.calculatePerimeter();
    
    if (perimeter < this.minPerimeter) {
      return null; // Too small
    }
    
    // 3. Calculate area (using Shoelace formula)
    const area = this.calculateArea();
    
    // 4. Calculate circularity (compactness)
    // Perfect circle: 4π * area / perimeter² = 1
    const circularity = (4 * Math.PI * area) / (perimeter * perimeter);
    
    if (circularity < this.circularityThreshold) {
      return null; // Not circular enough
    }
    
    // 5. Get bounding box
    const boundingBox = this.getBoundingBox();
    
    // 6. Check direction changes (loops)
    const hasLoop = this.detectLoop();
    
    if (!hasLoop) {
      return null; // No complete loop detected
    }
    
    // Success! Return gesture data
    return {
      isValid: true,
      boundingBox,
      circularity,
      area,
      perimeter,
      pointCount: this.points.length,
      duration: this.points[this.points.length - 1].timestamp - this.points[0].timestamp,
      center: this.getCenter(boundingBox),
      points: [...this.points] // Copy for visualization
    };
  }

  calculatePerimeter() {
    let perimeter = 0;
    for (let i = 1; i < this.points.length; i++) {
      perimeter += this.distance(this.points[i - 1], this.points[i]);
    }
    return perimeter;
  }

  calculateArea() {
    // Shoelace formula for polygon area
    let area = 0;
    const n = this.points.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += this.points[i].x * this.points[j].y;
      area -= this.points[j].x * this.points[i].y;
    }
    
    return Math.abs(area) / 2;
  }

  getBoundingBox() {
    if (this.points.length === 0) return null;
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    for (const point of this.points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      left: minX,
      top: minY,
      right: maxX,
      bottom: maxY
    };
  }

  getCenter(boundingBox) {
    return {
      x: boundingBox.x + boundingBox.width / 2,
      y: boundingBox.y + boundingBox.height / 2
    };
  }

  detectLoop() {
    // Check if path crosses itself or loops back
    // Simplified: check if we've covered at least 270 degrees
    
    if (this.points.length < 10) return false;
    
    const center = this.getCenter(this.getBoundingBox());
    let totalAngleChange = 0;
    let lastAngle = null;
    
    for (const point of this.points) {
      const angle = Math.atan2(point.y - center.y, point.x - center.x);
      
      if (lastAngle !== null) {
        let angleDiff = angle - lastAngle;
        
        // Normalize angle difference to [-π, π]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        totalAngleChange += Math.abs(angleDiff);
      }
      
      lastAngle = angle;
    }
    
    // Check if we've rotated enough (at least 270 degrees = 1.5π radians)
    return totalAngleChange >= 1.5 * Math.PI;
  }

  distance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  reset() {
    this.points = [];
    this.startPoint = null;
    this.isDrawing = false;
    this.startTime = null;
  }

  getPoints() {
    return [...this.points];
  }

  getDrawingTime() {
    if (this.points.length < 2) return 0;
    return this.points[this.points.length - 1].timestamp - this.points[0].timestamp;
  }
}

// Helper: Smooth path using Catmull-Rom spline
class PathSmoother {
  static smooth(points, tension = 0.5) {
    if (points.length < 3) return points;
    
    const smoothed = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      
      // Interpolate between p1 and p2
      const steps = 5;
      for (let t = 0; t < steps; t++) {
        const u = t / steps;
        const point = this.catmullRom(p0, p1, p2, p3, u, tension);
        smoothed.push(point);
      }
    }
    
    smoothed.push(points[points.length - 1]);
    return smoothed;
  }

  static catmullRom(p0, p1, p2, p3, t, tension) {
    const t2 = t * t;
    const t3 = t2 * t;
    
    const v0 = (p2.x - p0.x) * tension;
    const v1 = (p3.x - p1.x) * tension;
    
    const x = (2 * p1.x - 2 * p2.x + v0 + v1) * t3 +
              (-3 * p1.x + 3 * p2.x - 2 * v0 - v1) * t2 +
              v0 * t + p1.x;
    
    const w0 = (p2.y - p0.y) * tension;
    const w1 = (p3.y - p1.y) * tension;
    
    const y = (2 * p1.y - 2 * p2.y + w0 + w1) * t3 +
              (-3 * p1.y + 3 * p2.y - 2 * w0 - w1) * t2 +
              w0 * t + p1.y;
    
    return { x, y };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CircleGestureDetector, PathSmoother };
}