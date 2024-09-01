"use server";

import { connectToDatabase } from "@/lib/mongoose";
import { scrapeJobs } from "@/lib/server-utils";
import Job from  "@/lib/models/job.model";
import { NextResponse } from "next/server";
import { baseURL, NO_CACHE_HEADERS } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        connectToDatabase();
        
        //console.log("Beginning scraping...");
        const scrapedJobs = await scrapeJobs(baseURL);

        if (!scrapedJobs) return;

        for (const job of scrapedJobs) {
            try {
                //Check if job already exists in db using applyLink to prevent duplicate jobs entries
                const existingJob = await Job.findOne({ jobPostUrl: job.jobPostUrl });
                if (!existingJob) {
                    const newJob = new Job(job);
                    console.log(`Saving scraped job: ${newJob._id}`);
                    await newJob.save();
                }
            } catch (error: any) {
                throw new Error(`Failed to store job to db: ${error.message}`);
            } 
        }

        return NextResponse.json(
            { message: "Scrape Successed" },
            { headers: NO_CACHE_HEADERS }
        );
    } catch (error: any) {
        console.log(error.message);
        return NextResponse.json(
            { message: `Scrape failed: ${error.message}` },
            { headers: NO_CACHE_HEADERS }
        );
    }

}