import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();
  
  try {
    // Prefer FULL analysis if it exists
    const fullPath = path.join(process.cwd(), 'data', 'analysis', `${upperSymbol}_FULL.json`);
    const simplePath = path.join(process.cwd(), 'data', 'analysis', `${upperSymbol}.json`);
    
    let analysisPath = simplePath;
    try {
      await fs.access(fullPath);
      analysisPath = fullPath;
    } catch {
      // FULL file doesn't exist, use simple
    }
    
    const data = await fs.readFile(analysisPath, 'utf-8');
    const analysis = JSON.parse(data);
    
    return NextResponse.json(analysis);
  } catch {
    // Return default analysis structure if specific analysis not found
    return NextResponse.json({
      symbol: upperSymbol,
      available: false,
      message: "Detailed analysis not yet available for this stock. Using standard metrics.",
      valuationMethods: {
        graham: {
          verdict: "Check current margin",
          correlation: { "1Y": null, "3Y": null, "5Y": null, "10Y": null, "max": null },
          analysis: {
            "1Y": { text: "Analysis pending", reason: "Manual analysis required", recommendation: "Use with caution" }
          }
        },
        peterLynch: {
          verdict: "Check current margin",
          correlation: { "1Y": null, "3Y": null, "5Y": null, "10Y": null, "max": null },
          analysis: {
            "1Y": { text: "Analysis pending", reason: "Manual analysis required", recommendation: "Use with caution" }
          }
        },
        dcf: {
          verdict: "Check current margin",
          correlation: { "1Y": null, "3Y": null, "5Y": null, "10Y": null, "max": null },
          analysis: {
            "1Y": { text: "Analysis pending", reason: "Manual analysis required", recommendation: "Use with caution" }
          }
        },
        gfValue: {
          verdict: "Check current margin",
          correlation: { "1Y": null, "3Y": null, "5Y": null, "10Y": null, "max": null },
          analysis: {
            "1Y": { text: "Analysis pending", reason: "Manual analysis required", recommendation: "Use with caution" }
          }
        }
      }
    });
  }
}
