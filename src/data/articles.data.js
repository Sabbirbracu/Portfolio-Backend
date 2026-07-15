/**
 * Seed data migrated from the frontend's src/data/articles.ts.
 * `slug` is the natural key (was `id` in the static file) — the
 * migration script upserts on it.
 */
const articles = [
  {
    slug: "building-scalable-apis-nodejs",
    title: "Building Scalable APIs with Node.js and Express",
    description: "A comprehensive guide to designing and implementing production-ready REST APIs with best practices for error handling, validation, and performance optimization.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    date: "Dec 15, 2024",
    readTime: "8 min read",
    category: "Backend Development",
    published: true,
    content: `
# Building Scalable APIs with Node.js and Express

Building production-ready REST APIs requires careful consideration of architecture, error handling, validation, and performance. In this comprehensive guide, we'll explore best practices that I've learned from years of building enterprise applications.

## Setting Up the Foundation

The first step in building a scalable API is establishing a solid project structure. A well-organized codebase makes it easier to maintain and scale your application as it grows.

\`\`\`javascript
// Project structure
src/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
└── app.js
\`\`\`

## Error Handling Best Practices

One of the most critical aspects of API development is proper error handling. A consistent error response format helps API consumers understand and handle errors effectively.

\`\`\`javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
\`\`\`

## Validation and Security

Input validation is your first line of defense against malicious data. Using libraries like Joi or express-validator ensures that only valid data reaches your business logic.

## Performance Optimization

- Use caching strategies with Redis
- Implement pagination for large datasets
- Optimize database queries with proper indexing
- Use compression middleware for responses

## Conclusion

Building scalable APIs is an iterative process. Start with a solid foundation, implement proper error handling, and continuously monitor and optimize your application's performance.
    `,
  },
  {
    slug: "computer-vision-real-world",
    title: "Computer Vision in Real-World Applications",
    description: "Exploring how AI-powered vision systems are transforming industries from healthcare to autonomous vehicles, with practical implementation examples.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
    date: "Nov 28, 2024",
    readTime: "12 min read",
    category: "AI/ML",
    published: true,
    content: `
# Computer Vision in Real-World Applications

Computer vision has evolved from a research curiosity to a transformative technology powering real-world applications across industries. From healthcare diagnostics to autonomous vehicles, AI-powered vision systems are reshaping how machines perceive and interact with the world.

## Healthcare Revolution

Medical imaging analysis has been one of the most impactful applications of computer vision. AI systems can now detect diseases with accuracy rivaling human experts.

### Key Applications:
- **Radiology**: Detecting tumors in X-rays and MRIs
- **Pathology**: Analyzing tissue samples for cancer cells
- **Ophthalmology**: Screening for diabetic retinopathy

## Autonomous Vehicles

Self-driving cars rely heavily on computer vision to understand their environment. Multiple cameras and sensors work together to create a comprehensive view of the road.

\`\`\`python
# Object detection pipeline
import cv2
import numpy as np

def detect_objects(frame, model):
    blob = cv2.dnn.blobFromImage(frame, 1/255.0, (416, 416), swapRB=True)
    model.setInput(blob)
    outputs = model.forward(model.getUnconnectedOutLayersNames())
    return process_detections(outputs)
\`\`\`

## Manufacturing and Quality Control

Computer vision systems can inspect products at speeds and accuracy levels impossible for human inspectors, reducing defects and improving efficiency.

## The Future of Computer Vision

As hardware becomes more powerful and algorithms more sophisticated, we'll see computer vision integrated into even more aspects of daily life, from smart cities to personalized retail experiences.
    `,
  },
  {
    slug: "modern-react-patterns-enterprise",
    title: "Modern React Patterns for Enterprise Apps",
    description: "Deep dive into advanced React patterns including compound components, render props, and custom hooks for building maintainable enterprise applications.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop",
    date: "Oct 10, 2024",
    readTime: "10 min read",
    category: "Frontend",
    published: true,
    content: `
# Modern React Patterns for Enterprise Apps

Building enterprise-scale React applications requires more than just knowing the basics. Advanced patterns help create maintainable, scalable, and testable codebases that can evolve with your business needs.

## Compound Components Pattern

The compound component pattern allows you to create components that work together while maintaining a clean API. Think of it like HTML's \`<select>\` and \`<option>\` relationship.

\`\`\`tsx
// Usage
<Menu>
  <Menu.Button>Options</Menu.Button>
  <Menu.List>
    <Menu.Item>Edit</Menu.Item>
    <Menu.Item>Delete</Menu.Item>
  </Menu.List>
</Menu>
\`\`\`

## Custom Hooks for Business Logic

Extracting business logic into custom hooks makes your components cleaner and your logic more reusable and testable.

\`\`\`tsx
function useUser(userId: string) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}
\`\`\`

## State Management Patterns

For enterprise apps, consider using:
- **React Context** for theme and auth state
- **Redux Toolkit** for complex global state
- **React Query** for server state management

## Performance Optimization

- Memoization with \`useMemo\` and \`useCallback\`
- Code splitting with \`React.lazy\`
- Virtual lists for large datasets

## Conclusion

Mastering these patterns will help you build React applications that can scale with your organization's needs while remaining maintainable and performant.
    `,
  },
];

export default articles;
