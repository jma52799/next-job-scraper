import mongoose, { Document, Model, Schema } from 'mongoose';

export interface JobDocument extends Document {
    jobPostUrl: string;
    postedAt: string;
    companyName: string;
    title: string;
    location: string;
    jobType: string;
    applyLink: string;
    salary: string;
    skills: string[];
    description: string;
}

const jobSchema: Schema<JobDocument> = new Schema({
    jobPostUrl: {type: String, unique: true},
    postedAt: String,
    companyName: String,
    title: String,
    location: String,
    jobType: String,
    applyLink: {type: String},
    salary: String,
    skills: [String],
    description: String,
},{ timestamps: true });

/*
const jobSchema = new mongoose.Schema({
    postedAt: String,
    companyName: String,
    title: String,
    location: String,
    jobType: String,
    applyLink: {type: String, unique: true},
    salary: String,
    skills: [String],
    description: String,
}, { timestamps: true });
*/

const Job: Model<JobDocument> = mongoose.models.Job || mongoose.model('Job', jobSchema);
export default Job;