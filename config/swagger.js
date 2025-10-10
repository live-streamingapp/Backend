import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VastuGuru API Documentation",
      version: "1.0.0",
      description:
        "Comprehensive API documentation for VastuGuru - An astrology and spiritual learning platform",
      contact: {
        name: "API Support",
        email: "support@vastuguru.com",
      },
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Development server",
      },
      {
        url: process.env.API_URL || "https://api.vastuguru.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "JWT token stored in HTTP-only cookie",
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token for authentication",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d5ec49f1b2c8b1f8c8e8e8" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            phone: { type: "string", example: "+1234567890" },
            dob: {
              type: "object",
              properties: {
                day: { type: "number", example: 15 },
                month: { type: "number", example: 8 },
                year: { type: "number", example: 1990 },
              },
            },
            role: {
              type: "string",
              enum: ["student", "astrologer", "admin"],
              example: "student",
            },
            profileImage: { type: "string", example: "uploads/profile.jpg" },
            enrolledCourses: {
              type: "array",
              items: { type: "string" },
              example: ["60d5ec49f1b2c8b1f8c8e8e8"],
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Course: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d5ec49f1b2c8b1f8c8e8e8" },
            title: { type: "string", example: "Vedic Astrology Basics" },
            description: {
              type: "string",
              example: "Learn the fundamentals of Vedic astrology",
            },
            price: { type: "number", example: 999 },
            originalPrice: { type: "number", example: 1999 },
            image: { type: "string", example: "uploads/course.jpg" },
            createdBy: { type: "string", example: "60d5ec49f1b2c8b1f8c8e8e8" },
            languages: {
              type: "array",
              items: { type: "string" },
              example: ["English", "Hindi"],
            },
            subtitles: {
              type: "array",
              items: { type: "string" },
              example: ["English"],
            },
            premium: { type: "boolean", example: false },
            rating: { type: "number", example: 4.5 },
            ratingCount: { type: "number", example: 120 },
            learners: { type: "number", example: 500 },
            duration: { type: "number", example: 120 },
            lessons: { type: "number", example: 15 },
            whatYouWillLearn: {
              type: "array",
              items: { type: "string" },
              example: ["Understanding birth charts", "Planetary positions"],
            },
            courseContent: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  preview: { type: "boolean" },
                  video: { type: "string" },
                },
              },
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d5ec49f1b2c8b1f8c8e8e8" },
            title: { type: "string", example: "Rudraksha Mala" },
            description: {
              type: "string",
              example: "Authentic 108 bead Rudraksha mala",
            },
            category: {
              type: "string",
              enum: [
                "Gemstones",
                "Rudraksha",
                "Pooja Items",
                "Spiritual Books",
                "Color Gemstone",
                "Other",
              ],
              example: "Rudraksha",
            },
            price: { type: "number", example: 499 },
            quantity: { type: "number", example: 50 },
            images: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  url: { type: "string" },
                  alt: { type: "string" },
                },
              },
            },
            productCode: { type: "string", example: "RUD-108" },
            rating: {
              type: "object",
              properties: {
                average: { type: "number", example: 4.5 },
                count: { type: "number", example: 45 },
              },
            },
            isActive: { type: "boolean", example: true },
            isFeatured: { type: "boolean", example: false },
          },
        },
        Blog: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d5ec49f1b2c8b1f8c8e8e8" },
            title: {
              type: "string",
              example: "Understanding Your Birth Chart",
            },
            description: { type: "string" },
            mainImage: { type: "string", example: "uploads/blog-main.jpg" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  image: { type: "string" },
                },
              },
            },
            author: { type: "string", example: "60d5ec49f1b2c8b1f8c8e8e8" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d5ec49f1b2c8b1f8c8e8e8" },
            userId: { type: "string", example: "60d5ec49f1b2c8b1f8c8e8e8" },
            courses: {
              type: "array",
              items: { type: "string" },
            },
            totalAmount: { type: "number", example: 2499 },
            paymentStatus: {
              type: "string",
              enum: ["pending", "paid", "failed"],
              example: "pending",
            },
            orderStatus: {
              type: "string",
              enum: ["processing", "completed", "cancelled"],
              example: "processing",
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            status: { type: "boolean", example: false },
            code: { type: "number", example: 400 },
            message: { type: "string", example: "Error message" },
          },
        },
      },
    },
    tags: [
      { name: "Authentication", description: "User authentication endpoints" },
      { name: "Courses", description: "Course management endpoints" },
      { name: "Products", description: "Product management endpoints" },
      { name: "Blogs", description: "Blog management endpoints" },
      { name: "Orders", description: "Order management endpoints" },
      { name: "Cart", description: "Shopping cart endpoints" },
      { name: "Events", description: "Event management endpoints" },
      { name: "Services", description: "Service management endpoints" },
      {
        name: "Consultations",
        description: "Consultation management endpoints",
      },
      { name: "Books", description: "Book management endpoints" },
      { name: "Podcasts", description: "Podcast management endpoints" },
      { name: "Instructors", description: "Instructor management endpoints" },
      { name: "Banners", description: "Banner management endpoints" },
      { name: "Testimonials", description: "Testimonial management endpoints" },
      { name: "Tickets", description: "Ticket management endpoints" },
      { name: "Admin", description: "Admin management endpoints" },
      { name: "Contact", description: "Contact form endpoints" },
      { name: "About", description: "About us endpoints" },
      { name: "Numerology", description: "Numerology calculation endpoints" },
      { name: "Forums", description: "Course forum endpoints" },
      {
        name: "Notifications",
        description: "Notification management endpoints",
      },
      { name: "User", description: "User profile endpoints" },
    ],
  },
  apis: ["./routes/*.js", "./controllers/**/*.js", "./docs/*.js"], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
