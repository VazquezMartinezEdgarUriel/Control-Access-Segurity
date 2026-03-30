<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use Illuminate\Http\Request;

class VisitorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Visitor::all(), 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'nullable|email',
            'phone' => 'required|string',
            'identification' => 'required|string|unique:visitors',
            'company' => 'required|string',
            'purpose' => 'required|string',
            'nfc_id' => 'nullable|string|unique:visitors',
            'status' => 'nullable|in:active,inactive,pending'
        ]);

        $visitor = Visitor::create($validated);
        return response()->json($visitor, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $visitor = Visitor::with('accessLogs')->findOrFail($id);
        return response()->json($visitor, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $visitor = Visitor::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'nullable|email',
            'phone' => 'required|string',
            'identification' => 'required|string|unique:visitors,identification,' . $id,
            'company' => 'required|string',
            'purpose' => 'required|string',
            'nfc_id' => 'nullable|string|unique:visitors,nfc_id,' . $id,
            'status' => 'nullable|in:active,inactive,pending'
        ]);

        $visitor->update($validated);
        return response()->json($visitor, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $visitor = Visitor::findOrFail($id);
        $visitor->delete();
        return response()->json(['message' => 'Visitor deleted successfully'], 200);
    }

    /**
     * Get visitors by status
     */
    public function getByStatus($status)
    {
        $visitors = Visitor::where('status', $status)->get();
        return response()->json($visitors, 200);
    }

    /**
     * Update visitor status
     */
    public function updateStatus(Request $request, $id)
    {
        $visitor = Visitor::findOrFail($id);
        $visitor->status = $request->status;
        $visitor->save();
        return response()->json($visitor, 200);
    }
}
