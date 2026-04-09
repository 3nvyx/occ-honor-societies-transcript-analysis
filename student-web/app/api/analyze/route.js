import { NextResponse } from 'next/server';
import { analyzeTranscriptSubmission, PublicAnalysisError } from '../../../lib/server/analyze-transcript.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await analyzeTranscriptSubmission(body || {});
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PublicAnalysisError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    console.error('[student-web] analyze route failed:', error);
    return NextResponse.json(
      { error: 'The transcript could not be analyzed right now. Please try again.' },
      { status: 500 }
    );
  }
}
