import mongoose from 'mongoose';

const connectDB = async () => {
	try {
		// Set mongoose options for better performance and stability
		mongoose.set('strictQuery', true);
		
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			maxPoolSize: 10, // Maintain up to 10 socket connections
			serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
			socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
			bufferCommands: false // Disable mongoose buffering
		});
		
		console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
		console.log(`📊 Database Name: ${conn.connection.name}`);
		
		// Only enable debug in development
		if (process.env.NODE_ENV === 'development') {
			mongoose.set('debug', (coll, method, query, doc) => {
				console.log(`🔍 Mongoose: ${coll}.${method}`, JSON.stringify(query));
			});
		}
		
		// Handle connection events
		mongoose.connection.on('error', (err) => {
			console.error('❌ MongoDB connection error:', err);
		});
		
		mongoose.connection.on('disconnected', () => {
			console.log('⚠️ MongoDB disconnected');
		});
		
		mongoose.connection.on('reconnected', () => {
			console.log('🔄 MongoDB reconnected');
		});
		
	} catch (error) {
		console.error('❌ Database connection failed:', error.message);
		console.error('Full error:', error);
		process.exit(1);
	}
};

export default connectDB;
