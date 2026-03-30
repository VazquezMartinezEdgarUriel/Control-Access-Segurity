<?php

namespace App\Http\Controllers;

use App\Models\AccessLog;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AccessLogController extends Controller
{
    public function index()
    {
        $logs = AccessLog::with(['user', 'visitor'])->latest('entry_time')->paginate(50);
        return response()->json($logs, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'visitor_id' => 'nullable|exists:visitors,id',
            'entry_time' => 'required|date_format:Y-m-d H:i:s',
            'exit_time' => 'nullable|date_format:Y-m-d H:i:s',
            'access_type' => 'nullable|in:visitor,employee,contractor',
            'status' => 'nullable|in:allowed,denied',
            'nfc_card' => 'nullable|string'
        ]);

        $log = AccessLog::create($validated);
        return response()->json($log, 201);
    }

    public function show(string $id)
    {
        $log = AccessLog::with(['user', 'visitor'])->findOrFail($id);
        return response()->json($log, 200);
    }

    public function update(Request $request, string $id)
    {
        $log = AccessLog::findOrFail($id);
        $validated = $request->validate([
            'exit_time' => 'nullable|date_format:Y-m-d H:i:s',
            'status' => 'nullable|in:allowed,denied'
        ]);

        $log->update($validated);
        return response()->json($log, 200);
    }

    public function destroy(string $id)
    {
        $log = AccessLog::findOrFail($id);
        $log->delete();
        return response()->json(['message' => 'Access log deleted successfully'], 200);
    }

    public function recordEntry(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'visitor_id' => 'nullable|exists:visitors,id',
            'access_type' => 'nullable|in:visitor,employee,contractor',
            'nfc_card' => 'nullable|string'
        ]);

        $validated['entry_time'] = Carbon::now();
        $validated['status'] = 'allowed';

        $log = AccessLog::create($validated);
        return response()->json($log, 201);
    }

    public function recordExit(Request $request, $id)
    {
        $log = AccessLog::findOrFail($id);
        $log->exit_time = Carbon::now();
        $log->save();
        
        return response()->json($log, 200);
    }
}
