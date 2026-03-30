<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Visitor extends Model
{
    protected $fillable = [
        'name', 'email', 'phone', 'identification', 'company', 'purpose', 'nfc_id', 'status'
    ];

    public function accessLogs(): HasMany
    {
        return $this->hasMany(AccessLog::class);
    }
}
