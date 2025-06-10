// Test Supabase connection
import { supabase } from "./src/utils/supabaseClient.js";

async function testSupabaseConnection() {
	console.log("🧪 Testing Supabase Connection...\n");

	try {
		console.log("📡 Testing basic connection...");
		const { data, error } = await supabase.from("categories").select("count");

		if (error) {
			console.error("❌ Supabase connection failed:", error.message);
			console.error("Error details:", error);
			return false;
		}

		console.log("✅ Supabase connection successful!");
		console.log("Categories table accessible:", data);

		// Test each table
		const tables = ["categories", "quizzes", "questions", "device_scores"];

		for (const table of tables) {
			console.log(`\n📋 Testing ${table} table...`);
			const { data: tableData, error: tableError } = await supabase
				.from(table)
				.select("*")
				.limit(5);

			if (tableError) {
				console.error(`❌ Error accessing ${table}:`, tableError.message);
			} else {
				console.log(`✅ ${table} table: ${tableData.length} records found`);
				if (tableData.length > 0) {
					console.log(`   Sample record:`, tableData[0]);
				}
			}
		}

		return true;
	} catch (error) {
		console.error("💥 Connection test failed:", error);
		return false;
	}
}

testSupabaseConnection();
