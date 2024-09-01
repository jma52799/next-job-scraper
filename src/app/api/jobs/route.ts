import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Job from "@/lib/models/job.model";
import { NO_CACHE_HEADERS } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await connectToDatabase();

        const url = new URL(request.url);
        const resultsParam = url.searchParams.get("results");
        const results = resultsParam ? parseInt(resultsParam) : null;

        const jobs = results ? await Job.find({}).limit(results) : await Job.find({});

        // Check if the number of jobs fetched is less than the requested number
        if (results && jobs.length < results) {
            return NextResponse.json( 
                { message: `Less than ${results} entries exist in the database, showing all entries instead`, data: jobs },
                { headers: NO_CACHE_HEADERS }
            );
        }

        if (results) {
            return NextResponse.json(
                { message: `Fetched first ${results} entries`, data: jobs },
                { headers: NO_CACHE_HEADERS }
            );
        }

        return NextResponse.json(
            { message: "Ok", data: jobs },
            { headers: NO_CACHE_HEADERS }
        );
    } catch (error: any) {
        throw new Error(`Failed to get jobs from db: ${error.message}`);
    }
}