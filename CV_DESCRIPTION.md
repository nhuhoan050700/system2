# CV Project Description

## Hospital Testing Service Center - Workflow Automation System

### Project Overview
Designed and developed an end-to-end QR-based patient check-in system for hospital testing services, automating the entire patient journey from check-in to test completion using n8n workflow automation, PostgreSQL, and modern web technologies.

### Technical Stack
- **Workflow Engine**: n8n (self-hosted/cloud)
- **Database**: PostgreSQL (Railway)
- **Frontend**: Next.js 14, React 18, TypeScript
- **Authentication**: Google OAuth 2.0
- **Payment Processing**: Stripe API
- **Email**: SMTP integration
- **Real-time Updates**: Polling-based status synchronization
- **Audio Guidance**: Web Speech API (Text-to-Speech)
- **Analytics**: Azure Data Factory (ADF) + Power BI

### Key Features Implemented

#### 1. QR Code-Based Check-In System
- QR code scanning interface for patient entry
- Google OAuth integration for secure authentication
- User data collection and database persistence

#### 2. Automated Workflow Orchestration (n8n)
- **Check-in Workflow**: User authentication and profile creation
- **Procedure Selection**: Service catalog with dynamic pricing
- **Payment Processing**: Stripe integration with webhook handling
- **Email Confirmation**: Automated transactional emails
- **Status Updates**: Real-time order status management
- **Worker Dashboard API**: Staff interface endpoints

#### 3. Database Design & Management
- Designed PostgreSQL schema with proper relationships
- Implemented automated order number generation
- Queue number assignment based on room and date
- Status tracking with audit logs
- Optimized queries with indexes

#### 4. Payment Integration
- Stripe payment processing (test mode)
- Secure payment method handling
- Order status updates post-payment
- Payment confirmation workflow

#### 5. Real-Time Status Synchronization
- Polling-based status updates (3-second intervals)
- Cross-platform status synchronization
- Patient interface auto-updates
- Worker dashboard real-time refresh

#### 6. Audio Guidance System
- Text-to-Speech integration for patient navigation
- Automated audio notifications on status changes
- Room and queue number announcements
- Manual audio playback option

#### 7. Worker Dashboard
- Staff interface for order management
- Real-time order list with filtering
- Status update controls (Start Test, Mark Completed)
- Order details display (patient, procedure, room, queue)

#### 8. Analytics & Business Intelligence
- **Azure Data Factory (ADF)**: Scheduled ETL pipelines extracting from PostgreSQL to Azure SQL
- **Power BI Dashboards**: Automated scheduled refreshes for operational analytics
- **Data Warehouse**: Fact and dimension tables optimized for reporting
- **Key Metrics**: Daily revenue, order trends, procedure performance, patient demographics
- **Automation**: ADF runs daily at 00:00 UTC, Power BI refreshes at 00:30 UTC

### Technical Highlights

#### Architecture
- **Event-driven workflow system** using n8n
- **RESTful API design** with webhook endpoints
- **Separation of concerns**: Frontend, workflows, database
- **Scalable design** with Railway PostgreSQL

#### Database Schema
- Users table with Google OAuth integration
- Procedures catalog with pricing and room assignment
- Orders table with status tracking
- Order updates log for audit trail
- Automated triggers for timestamps

#### Workflow Design
- Modular workflow architecture
- Error handling and validation
- Database transaction management
- Email template system
- Status state machine

#### Frontend Features
- Responsive design with Tailwind CSS
- Multi-step form flow
- Real-time status polling
- Audio notifications
- Error handling and loading states

### Skills Demonstrated

✅ **Workflow Automation**: n8n workflow design and implementation  
✅ **Database Design**: PostgreSQL schema design and optimization  
✅ **Full-Stack Development**: Frontend (Next.js) + Backend (n8n) + Database  
✅ **API Integration**: OAuth, Payment, Email services  
✅ **Real-Time Systems**: Status synchronization and updates  
✅ **System Architecture**: Event-driven, modular design  
✅ **Problem Solving**: End-to-end workflow automation  
✅ **Modern Web Technologies**: React, TypeScript, Next.js  
✅ **Data Engineering**: Azure Data Factory ETL pipelines  
✅ **Business Intelligence**: Power BI dashboards with automated refreshes  
✅ **Data Warehouse Design**: Fact and dimension table architecture  

### Project Impact

This project demonstrates:
- **Workflow automation** for healthcare processes
- **Integration** of multiple third-party services
- **Real-time** data synchronization
- **User experience** design for both patients and staff
- **Scalable architecture** suitable for production

### Deployment

- **Frontend**: Vercel (Next.js)
- **Worker Dashboard**: Vercel (separate deployment)
- **Database**: Railway PostgreSQL
- **Workflows**: n8n.cloud or self-hosted

### Future Enhancements

- WebSocket-based real-time updates (replace polling)
- QR code scanning with camera API
- SMS notifications in addition to email
- Multi-language support
- Analytics dashboard
- Mobile app (React Native)

---

**Technologies**: n8n, PostgreSQL, Next.js, React, TypeScript, Stripe, Google OAuth, Tailwind CSS, Railway, Vercel, Azure Data Factory, Power BI, Azure SQL

**Duration**: [Your timeline]

**Role**: Full-Stack Developer / Workflow Automation Engineer / Data Engineer
